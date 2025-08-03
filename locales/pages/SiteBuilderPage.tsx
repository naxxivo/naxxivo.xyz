import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/App';
import { supabase } from '@/locales/en/pages/services/supabase';
import { UserSite, SiteComponent, UserSiteInsert, SiteComponentInsert } from '@/types';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { AnimeLoader } from '@/components/ui/Loader';
import Button from '@/components/ui/Button';
import PageTransition from '@/components/ui/PageTransition';
import SiteBuilderToolbar from '@/components/sitebuilder/SiteBuilderToolbar';
import SettingsPanel from '@/components/sitebuilder/SettingsPanel';
import ComponentWrapper from '@/components/sitebuilder/ComponentWrapper';
import { useTranslation } from 'react-i18next';

const ResponsiveGridLayout = WidthProvider(Responsive);

const useDebounce = (value: any, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const SiteBuilderPage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [site, setSite] = useState<UserSite | null>(null);
    const [components, setComponents] = useState<SiteComponent[]>([]);
    const [activeComponentId, setActiveComponentId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const debouncedComponents = useDebounce(components, 1500);

    const fetchSiteData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const { data: siteData, error: siteError } = await supabase
            .from('user_sites')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (siteData) {
            setSite(siteData);
            const { data: componentsData, error: componentsError } = await supabase
                .from('site_components')
                .select('*')
                .eq('site_id', siteData.id);
            if (componentsError) {
                setError('Failed to load site components.');
            } else {
                setComponents(componentsData || []);
            }
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchSiteData();
    }, [fetchSiteData]);

    useEffect(() => {
        const saveChanges = async () => {
            if (!debouncedComponents || debouncedComponents.length === 0) return;
            setSaving(true);
            
            const updates = debouncedComponents.map(c => 
                supabase.from('site_components').update({
                    component_data: c.component_data,
                    grid_position: c.grid_position
                }).eq('id', c.id)
            );
            
            await Promise.all(updates);

            setTimeout(() => setSaving(false), 500);
        };
        saveChanges();
    }, [debouncedComponents]);

    const handleCreateSite = async () => {
        if (!user) return;
        setIsCreating(true);
        const payload: UserSiteInsert = { id: user.id, user_id: user.id };
        const { data, error } = await supabase.from('user_sites').insert(payload).select().single();
        if (error) {
            setError('Failed to create your site. ' + error.message);
        } else if (data) {
            setSite(data);
        }
        setIsCreating(false);
    };

    const addComponent = async (type: 'text' | 'image' | 'video') => {
        if (!site) return;
        const newPosition = { x: 0, y: Infinity, w: 4, h: 2, i: Date.now().toString() };
        const defaultData = type === 'text' ? { text: 'New Text Block' } : { url: '' };

        const payload: SiteComponentInsert = {
            site_id: site.id,
            component_type: type,
            component_data: defaultData,
            grid_position: newPosition
        };

        const { data, error } = await supabase.from('site_components').insert(payload).select().single();
        if (error) {
            setError("Failed to add component.");
        } else if (data) {
            setComponents(prev => [...prev, data]);
        }
    };

    const deleteComponent = async (id: number) => {
        if (activeComponentId === id) setActiveComponentId(null);
        setComponents(prev => prev.filter(c => c.id !== id));
        await supabase.from('site_components').delete().eq('id', id);
    };

    const onLayoutChange = (newLayout: Layout[]) => {
        setComponents(prev => prev.map(c => {
            const layoutItem = newLayout.find(l => l.i === c.grid_position.i);
            if (layoutItem) {
                return { ...c, grid_position: { ...c.grid_position, ...layoutItem } };
            }
            return c;
        }));
    };
    
    const updateComponentData = (id: number, newData: object) => {
        setComponents(prev => prev.map(c =>
            c.id === id ? { ...c, component_data: { ...c.component_data, ...newData } } : c
        ));
    };
    
    const updateSiteStatus = async (isPublished: boolean) => {
        if (!site) return;
        setSite(s => s ? { ...s, published: isPublished } : null);
        await supabase.from('user_sites').update({ published: isPublished }).eq('id', site.id);
    }

    if (loading) return <AnimeLoader />;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    if (!site) {
        return (
            <PageTransition>
                <div className="text-center">
                    <h1 className="font-display text-4xl">Create Your Personal Site</h1>
                    <p className="my-4">Design a public page to showcase your work, links, or anything you want!</p>
                    <Button onClick={handleCreateSite} disabled={isCreating}>
                        {isCreating ? t('siteBuilder.creating') : t('siteBuilder.createSite')}
                    </Button>
                </div>
            </PageTransition>
        );
    }

    const activeComponent = components.find(c => c.id === activeComponentId) || null;
    const layout = components.map(c => c.grid_position);

    return (
        <PageTransition>
            <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-10rem)]">
                {/* Main Editor */}
                <div className="flex-grow bg-gray-100 dark:bg-dark-bg/50 rounded-lg p-2 overflow-auto">
                    <SiteBuilderToolbar onAddComponent={addComponent} onPublishToggle={updateSiteStatus} isPublished={site.published} saving={saving}/>
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={{ lg: layout }}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        rowHeight={30}
                        onLayoutChange={(layout, allLayouts) => onLayoutChange(layout)}
                    >
                        {components.map(component => (
                            <div key={component.grid_position.i}>
                                <ComponentWrapper
                                    component={component}
                                    onDelete={deleteComponent}
                                    onSelect={() => setActiveComponentId(component.id)}
                                    isActive={activeComponentId === component.id}
                                />
                            </div>
                        ))}
                    </ResponsiveGridLayout>
                </div>
                {/* Settings Panel */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    <SettingsPanel
                        activeComponent={activeComponent}
                        onUpdate={updateComponentData}
                        onClose={() => setActiveComponentId(null)}
                    />
                </div>
            </div>
        </PageTransition>
    );
};

export default SiteBuilderPage;

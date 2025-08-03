import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/locales/en/pages/services/supabase';
import { UserSite, SiteComponent, Profile } from '@/types';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { AnimeLoader } from '@/components/ui/Loader';
import PageTransition from '@/components/ui/PageTransition';
import RenderedComponent from '@/components/sitebuilder/RenderedComponent';
import { useTranslation } from 'react-i18next';

const ResponsiveGridLayout = WidthProvider(Responsive);

const PublicSitePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { t } = useTranslation();
    const [site, setSite] = useState<UserSite | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [components, setComponents] = useState<SiteComponent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSite = async () => {
            if (!username) {
                setError(t('siteBuilder.siteNotFound'));
                setLoading(false);
                return;
            }

            setLoading(true);
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', username)
                .single();

            if (profileError || !profileData) {
                setError(t('siteBuilder.siteNotFound'));
                setLoading(false);
                return;
            }
            
            setProfile(profileData);

            const { data: siteData, error: siteError } = await supabase
                .from('user_sites')
                .select('*')
                .eq('user_id', profileData.id)
                .single();

            if (siteError || !siteData) {
                setError(t('siteBuilder.siteNotFound'));
                setLoading(false);
                return;
            }
            
            if (!siteData.published) {
                 setError(t('siteBuilder.siteNotPublished'));
                 setLoading(false);
                 return;
            }

            setSite(siteData);
            
            const { data: componentsData, error: componentsError } = await supabase
                .from('site_components')
                .select('*')
                .eq('site_id', siteData.id);

            if (componentsError) {
                setError("Error loading site content.");
            } else {
                setComponents(componentsData || []);
            }
            
            setLoading(false);
        };

        fetchSite();
    }, [username, t]);
    
    if (loading) return <AnimeLoader />;
    
    if (error) {
        return (
            <PageTransition>
                <div className="text-center py-20">
                    <h1 className="font-display text-4xl">{error}</h1>
                    <Link to="/" className="mt-6 inline-block text-accent hover:underline">
                        &larr; Go Home
                    </Link>
                </div>
            </PageTransition>
        );
    }
    
    const layout = components.map(c => c.grid_position);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-dark-bg">
             <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={30}
                isDraggable={false}
                isResizable={false}
             >
                {components.map(component => (
                    <div key={component.grid_position.i} className="bg-white dark:bg-dark-card rounded-lg p-4 shadow-md overflow-auto">
                        <RenderedComponent 
                            type={component.component_type}
                            data={component.component_data}
                        />
                    </div>
                ))}
            </ResponsiveGridLayout>
            {profile && (
                 <footer className="text-center p-4 text-xs text-gray-400">
                    Site by <Link to={`/profile/${profile.id}`} className="font-bold hover:underline">{profile.name || profile.username}</Link> | Powered by NAXXIVO
                </footer>
            )}
        </div>
    );
};

export default PublicSitePage;

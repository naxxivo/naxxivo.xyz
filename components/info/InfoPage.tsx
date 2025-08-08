import React, { useState } from 'react';
import { ChevronRightIcon } from '../common/AppIcons';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoPageProps {
    onBack: () => void;
}

const AccordionItem = ({ title, children, i }: { title: string, children: React.ReactNode, i: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <motion.div
            {...{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: i * 0.1 },
            } as any}
            className="bg-[var(--theme-card-bg)] rounded-lg shadow-sm overflow-hidden"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left"
            >
                <h2 className="font-semibold text-[var(--theme-text)]">{title}</h2>
                <motion.div {...{ animate: { rotate: isOpen ? 90 : 0 } } as any}>
                    <ChevronRightIcon />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="content"
                        {...{
                            initial: "collapsed",
                            animate: "open",
                            exit: "collapsed",
                            variants: {
                                open: { opacity: 1, height: 'auto' },
                                collapsed: { opacity: 0, height: 0 }
                            },
                            transition: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] },
                        } as any}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0 text-sm text-[var(--theme-text-secondary)] space-y-2 prose dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

const InfoPage: React.FC<InfoPageProps> = ({ onBack }) => {
    return (
        <div className="min-h-full flex flex-col">
            <main className="flex-grow overflow-y-auto space-y-3">
                <AccordionItem title="Getting Started" i={0}>
                    <p>Welcome to NAXXIVO! Here's how to get started:</p>
                    <ul>
                        <li><strong>XP (Experience Points):</strong> You earn XP by being active in the community. You can use XP to buy cool items from The Bazaar.</li>
                        <li><strong>Posting:</strong> Share your thoughts and media from the Home page. Use the '+' button to open the full post creator.</li>
                        <li><strong>Following:</strong> See a traveler you like? Hit the "Follow" button on their post or profile to see more from them.</li>
                    </ul>
                </AccordionItem>
                <AccordionItem title="The Bazaar & Your Satchel" i={1}>
                    <p>Customize your experience with unique items.</p>
                    <ul>
                        <li><strong>The Bazaar:</strong> This is the official store. Use your XP to purchase profile effects, themes, badges and more.</li>
                        <li><strong>My Satchel:</strong> This is your personal collection. After buying an item, find it here and click "Equip" to apply it to your profile.</li>
                    </ul>
                </AccordionItem>
                 <AccordionItem title="XP & Subscriptions" i={2}>
                    <p>Level up your journey with more XP.</p>
                    <ul>
                        <li><strong>Top Up XP:</strong> Need more XP? Visit the "Top Up XP" tool to buy packages.</li>
                        <li><strong>Subscriptions:</strong> Get the best value by subscribing! You get a large amount of XP upfront and can claim free XP every single day.</li>
                    </ul>
                </AccordionItem>
                 <AccordionItem title="Community Rules" i={3}>
                    <p>Help us keep NAXXIVO a safe and positive place.</p>
                    <ol>
                        <li><strong>Be Kind & Respectful:</strong> Treat everyone with respect. Harassment, bullying, and hate speech are not tolerated.</li>
                        <li><strong>No Spam:</strong> Do not post repetitive content or unsolicited advertisements.</li>
                        <li><strong>Respect Privacy:</strong> Do not share private information about others without their consent.</li>
                    </ol>
                </AccordionItem>
                 <AccordionItem title="What's Next? (Roadmap)" i={4}>
                    <p>We're always building! Here's a peek at what's coming soon:</p>
                    <ul>
                        <li><strong>Gifting:</strong> Send items from The Bazaar to your friends.</li>
                        <li><strong>Albums:</strong> Organize your posts and memories into beautiful, shareable albums.</li>
                        <li><strong>Profile Polls:</strong> Let your followers vote on questions you post.</li>
                         <li><strong>Health Hub:</strong> Track your wellness and fitness goals.</li>
                    </ul>
                </AccordionItem>
            </main>
        </div>
    );
};

export default InfoPage;
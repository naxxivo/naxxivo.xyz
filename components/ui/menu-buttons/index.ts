import DefaultButton from './DefaultButton';
import FlipButton from './FlipButton';
import SpinAndMorphButton from './SpinAndMorphButton';
import SlideButton from './SlideButton';
import PulseButton from './PulseButton';
import SparkleButton from './SparkleButton';
import GooeyButton from './GooeyButton';

export const menuButtonComponents = {
    default: DefaultButton,
    flip: FlipButton,
    gooey: GooeyButton,
    pulse: PulseButton,
    slide: SlideButton,
    sparkle: SparkleButton,
    spin: SpinAndMorphButton,
};

export type MenuButtonStyle = keyof typeof menuButtonComponents;

interface MenuButtonProps {
    isOpen: boolean;
    onClick: () => void;
}

export const menuButtonStyles: { name: string, style: MenuButtonStyle, component: React.FC<MenuButtonProps> }[] = [
    { name: 'Default', style: 'default', component: DefaultButton },
    { name: 'Flip', style: 'flip', component: FlipButton },
    { name: 'Gooey', style: 'gooey', component: GooeyButton },
    { name: 'Pulse', style: 'pulse', component: PulseButton },
    { name: 'Slide', style: 'slide', component: SlideButton },
    { name: 'Sparkle', style: 'sparkle', component: SparkleButton },
    { name: 'Spin', style: 'spin', component: SpinAndMorphButton },
];

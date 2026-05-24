import { Link as RouterLink } from "expo-router";
import Animated from "react-native-reanimated";
import React from "react";
import {
  View as RNView,
  Text as RNText,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  TouchableHighlight as RNTouchableHighlight,
  TextInput as RNTextInput,
  FlatList as RNFlatList,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

// Static color mappings for standard Tailwind colors used in the project
const COLOR_MAP: Record<string, string> = {
  'bg-cyan-500/10': 'rgba(6, 182, 212, 0.1)',
  'bg-red-500/10': 'rgba(239, 68, 68, 0.1)',
  'border-red-500/10': 'rgba(239, 68, 68, 0.1)',
  'border-red-500/20': 'rgba(239, 68, 68, 0.2)',
  'text-cyan-400': '#22D3EE',
  'text-red-400': '#F87171',
};

// Helper to convert hex to rgba
function hexToRgba(hex: string, opacity: number): string {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})`
    : hex;
}

// Parses classnames into separate styles for normal, active, and disabled states
export function parseClassNamesWithStates(className?: string) {
  const normalStyle: any = {};
  const activeStyle: any = {};
  const disabledStyle: any = {};

  if (!className) {
    return { normalStyle, activeStyle, disabledStyle };
  }

  const classes = className.split(/\s+/);
  for (const rawCls of classes) {
    if (!rawCls) continue;

    let cls = rawCls;
    let target = normalStyle;

    if (cls.startsWith('active:')) {
      target = activeStyle;
      cls = cls.substring(7);
    } else if (cls.startsWith('disabled:')) {
      target = disabledStyle;
      cls = cls.substring(9);
    } else if (cls.startsWith('focus:')) {
      cls = cls.substring(6);
    }

    // Static color mapping
    if (COLOR_MAP[cls]) {
      const colorVal = COLOR_MAP[cls];
      if (cls.startsWith('text-')) target.color = colorVal;
      else if (cls.startsWith('bg-')) target.backgroundColor = colorVal;
      else if (cls.startsWith('border-')) target.borderColor = colorVal;
      continue;
    }

    // Arbitrary color bg-[#HEX]/OPACITY or bg-[#HEX]
    if (cls.startsWith('bg-[')) {
      const match = cls.match(/bg-\[(#[0-9a-fA-F]+)(?:\/(\d+))?\]/);
      if (match) {
        const hex = match[1];
        const opacity = match[2] ? parseFloat(match[2]) / 100 : 1;
        target.backgroundColor = hexToRgba(hex, opacity);
      }
      continue;
    }

    // Arbitrary color border-[#HEX]/OPACITY or border-[#HEX]
    if (cls.startsWith('border-[')) {
      const match = cls.match(/border-\[(#[0-9a-fA-F]+)(?:\/(\d+))?\]/);
      if (match) {
        const hex = match[1];
        const opacity = match[2] ? parseFloat(match[2]) / 100 : 1;
        target.borderColor = hexToRgba(hex, opacity);
      }
      continue;
    }

    // Arbitrary color or font size text-[#HEX]/OPACITY or text-[size]
    if (cls.startsWith('text-[')) {
      const sizeMatch = cls.match(/text-\[(\d+)px\]/);
      if (sizeMatch) {
        target.fontSize = parseInt(sizeMatch[1]);
        continue;
      }
      const colorMatch = cls.match(/text-\[(#[0-9a-fA-F]+)(?:\/(\d+))?\]/);
      if (colorMatch) {
        const hex = colorMatch[1];
        const opacity = colorMatch[2] ? parseFloat(colorMatch[2]) / 100 : 1;
        target.color = hexToRgba(hex, opacity);
      }
      continue;
    }

    // Arbitrary shadow color shadow-[#HEX]/OPACITY or shadow-[#HEX]
    if (cls.startsWith('shadow-[')) {
      const match = cls.match(/shadow-\[(#[0-9a-fA-F]+)(?:\/(\d+))?\]/);
      if (match) {
        const hex = match[1];
        const opacity = match[2] ? parseFloat(match[2]) / 100 : 1;
        target.shadowColor = hexToRgba(hex, opacity);
        target.shadowOffset = { width: 0, height: 2 };
        target.shadowOpacity = opacity;
        target.shadowRadius = 4;
        target.elevation = 4;
      }
      continue;
    }

    // Arbitrary max width max-w-[size]
    if (cls.startsWith('max-w-[')) {
      const match = cls.match(/max-w-\[(?:(\d+)px|(\d+%))\]/);
      if (match) {
        target.maxWidth = match[1] ? parseInt(match[1]) : match[2];
      }
      continue;
    }

    // Margins
    if (cls.startsWith('m-')) {
      const val = parseFloat(cls.substring(2));
      if (!isNaN(val)) target.margin = val * 4;
      continue;
    }
    if (cls.startsWith('mx-')) {
      const val = parseFloat(cls.substring(3));
      if (!isNaN(val)) target.marginHorizontal = val * 4;
      continue;
    }
    if (cls.startsWith('my-')) {
      const val = parseFloat(cls.substring(3));
      if (!isNaN(val)) target.marginVertical = val * 4;
      continue;
    }
    if (cls.startsWith('mt-')) {
      const val = parseFloat(cls.substring(3));
      if (!isNaN(val)) target.marginTop = val * 4;
      continue;
    }
    if (cls.startsWith('mb-')) {
      const val = parseFloat(cls.substring(3));
      if (!isNaN(val)) target.marginBottom = val * 4;
      continue;
    }
    if (cls.startsWith('ml-')) {
      const val = parseFloat(cls.substring(3));
      if (!isNaN(val)) target.marginLeft = val * 4;
      continue;
    }
    if (cls.startsWith('mr-')) {
      const val = parseFloat(cls.substring(3));
      if (!isNaN(val)) target.marginRight = val * 4;
      continue;
    }

    // Paddings
    if (cls.startsWith('p-')) {
      const val = parseFloat(cls.substring(2));
      if (!isNaN(val)) target.padding = val * 4;
      continue;
    }
    if (cls.startsWith('px-')) {
      const val = parseFloat(cls.substring(3));
      if (!isNaN(val)) target.paddingHorizontal = val * 4;
      continue;
    }
    if (cls.startsWith('py-')) {
      const val = parseFloat(cls.substring(3));
      if (!isNaN(val)) target.paddingVertical = val * 4;
      continue;
    }
    if (cls.startsWith('pt-')) {
      const val = parseFloat(cls.substring(3));
      if (!isNaN(val)) target.paddingTop = val * 4;
      continue;
    }
    if (cls.startsWith('pb-')) {
      const val = parseFloat(cls.substring(3));
      if (!isNaN(val)) target.paddingBottom = val * 4;
      continue;
    }
    if (cls.startsWith('pl-')) {
      const val = parseFloat(cls.substring(3));
      if (!isNaN(val)) target.paddingLeft = val * 4;
      continue;
    }
    if (cls.startsWith('pr-')) {
      const val = parseFloat(cls.substring(3));
      if (!isNaN(val)) target.paddingRight = val * 4;
      continue;
    }

    // Widths
    if (cls.startsWith('w-')) {
      if (cls === 'w-full') {
        target.width = '100%';
      } else {
        const val = parseFloat(cls.substring(2));
        if (!isNaN(val)) target.width = val * 4;
      }
      continue;
    }

    // Heights
    if (cls.startsWith('h-')) {
      if (cls === 'h-full') {
        target.height = '100%';
      } else {
        const val = parseFloat(cls.substring(2));
        if (!isNaN(val)) target.height = val * 4;
      }
      continue;
    }

    // Gaps
    if (cls.startsWith('gap-')) {
      const val = parseFloat(cls.substring(4));
      if (!isNaN(val)) target.gap = val * 4;
      continue;
    }

    // Border Radius
    if (cls.startsWith('rounded-')) {
      if (cls === 'rounded-full') target.borderRadius = 9999;
      else if (cls === 'rounded-xl') target.borderRadius = 12;
      else if (cls === 'rounded-2xl') target.borderRadius = 16;
      else if (cls === 'rounded-3xl') target.borderRadius = 24;
      else if (cls === 'rounded-sm') target.borderRadius = 2;
      else if (cls === 'rounded-md') target.borderRadius = 6;
      else if (cls === 'rounded-lg') target.borderRadius = 8;
      else {
        const val = parseFloat(cls.substring(8));
        if (!isNaN(val)) target.borderRadius = val * 4;
      }
      continue;
    }

    // Flex layouts
    if (cls === 'flex-1') { target.flex = 1; continue; }
    if (cls === 'flex-row') { target.flexDirection = 'row'; continue; }
    if (cls === 'flex-col') { target.flexDirection = 'column'; continue; }
    if (cls === 'flex-wrap') { target.flexWrap = 'wrap'; continue; }
    if (cls === 'items-baseline') { target.alignItems = 'baseline'; continue; }
    if (cls === 'items-center') { target.alignItems = 'center'; continue; }
    if (cls === 'items-start') { target.alignItems = 'flex-start'; continue; }
    if (cls === 'items-end') { target.alignItems = 'flex-end'; continue; }
    if (cls === 'justify-center') { target.justifyContent = 'center'; continue; }
    if (cls === 'justify-between') { target.justifyContent = 'space-between'; continue; }
    if (cls === 'justify-start') { target.justifyContent = 'flex-start'; continue; }
    if (cls === 'justify-end') { target.justifyContent = 'flex-end'; continue; }

    // Text Properties
    if (cls === 'text-white') { target.color = '#FFFFFF'; continue; }
    if (cls === 'text-center') { target.textAlign = 'center'; continue; }
    if (cls === 'text-right') { target.textAlign = 'right'; continue; }
    if (cls === 'uppercase') { target.textTransform = 'uppercase'; continue; }
    if (cls === 'capitalize') { target.textTransform = 'capitalize'; continue; }
    if (cls === 'font-bold') { target.fontWeight = 'bold'; continue; }
    if (cls === 'font-semibold') { target.fontWeight = '600'; continue; }
    if (cls === 'font-medium') { target.fontWeight = '500'; continue; }
    if (cls === 'font-extrabold') { target.fontWeight = '800'; continue; }

    // Font Sizes
    if (cls === 'text-xs') { target.fontSize = 12; continue; }
    if (cls === 'text-sm') { target.fontSize = 14; continue; }
    if (cls === 'text-base') { target.fontSize = 16; continue; }
    if (cls === 'text-lg') { target.fontSize = 18; continue; }
    if (cls === 'text-xl') { target.fontSize = 20; continue; }
    if (cls === 'text-2xl') { target.fontSize = 24; continue; }
    if (cls === 'text-3xl') { target.fontSize = 30; continue; }
    if (cls === 'text-4xl') { target.fontSize = 36; continue; }

    // Line height and letter spacing
    if (cls === 'leading-relaxed') { target.lineHeight = 22; continue; }
    if (cls === 'tracking-tight') { target.letterSpacing = -0.5; continue; }
    if (cls === 'tracking-wider') { target.letterSpacing = 0.5; continue; }

    // Border properties
    if (cls === 'border') { target.borderWidth = 1; continue; }
    if (cls === 'border-4') { target.borderWidth = 4; continue; }
    if (cls === 'border-t') { target.borderTopWidth = 1; continue; }
    if (cls === 'border-b') { target.borderBottomWidth = 1; continue; }
    if (cls === 'border-l') { target.borderLeftWidth = 1; continue; }
    if (cls === 'border-r') { target.borderRightWidth = 1; continue; }
    if (cls === 'border-dashed') { target.borderStyle = 'dashed'; continue; }

    // Position & Overflow
    if (cls === 'absolute') { target.position = 'absolute'; continue; }
    if (cls === 'relative') { target.position = 'relative'; continue; }
    if (cls === 'inset-0') {
      target.top = 0;
      target.bottom = 0;
      target.left = 0;
      target.right = 0;
      continue;
    }
    if (cls === 'overflow-hidden') { target.overflow = 'hidden'; continue; }

    // Shadow pre-sets
    if (cls === 'shadow-lg') {
      target.shadowOffset = { width: 0, height: 10 };
      target.shadowOpacity = 0.15;
      target.shadowRadius = 20;
      target.elevation = 8;
      continue;
    }
    if (cls === 'shadow-md') {
      target.shadowOffset = { width: 0, height: 4 };
      target.shadowOpacity = 0.1;
      target.shadowRadius = 8;
      target.elevation = 4;
      continue;
    }

    // Minimum height
    if (cls === 'min-h-full') { target.minHeight = '100%'; continue; }
  }

  return { normalStyle, activeStyle, disabledStyle };
}

// Spacing helper for children layout (space-y-X, space-x-X)
function applySpacingToChildren(children: React.ReactNode, className?: string) {
  if (!className || !children) return children;

  let spaceYVal = 0;
  let spaceXVal = 0;

  const spaceYMatch = className.match(/\bspace-y-([\d.]+)\b/);
  if (spaceYMatch) {
    spaceYVal = parseFloat(spaceYMatch[1]) * 4;
  }

  const spaceXMatch = className.match(/\bspace-x-([\d.]+)\b/);
  if (spaceXMatch) {
    spaceXVal = parseFloat(spaceXMatch[1]) * 4;
  }

  if (spaceYVal === 0 && spaceXVal === 0) return children;

  let validIndex = 0;
  return React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const isFirst = validIndex === 0;
      validIndex++;
      if (!isFirst) {
        const addedStyle: any = {};
        if (spaceYVal > 0) addedStyle.marginTop = spaceYVal;
        if (spaceXVal > 0) addedStyle.marginLeft = spaceXVal;

        const childElement = child as React.ReactElement<any>;
        const childStyle = [childElement.props.style, addedStyle];
        return React.cloneElement(childElement, { style: StyleSheet.flatten(childStyle) });
      }
    }
    return child;
  });
}

// Custom style-mapping runner
function useCssElement(Component: any, props: any, config: Record<string, string>) {
  const newProps = { ...props };
  const { normalStyle, activeStyle, disabledStyle } = parseClassNamesWithStates(props.className);

  // Compile base style
  const baseStyle: any = [normalStyle];
  if (props.disabled && Object.keys(disabledStyle).length > 0) {
    baseStyle.push(disabledStyle);
  }

  // Handle configured className properties
  for (const [sourceProp, targetProp] of Object.entries(config)) {
    if (sourceProp === 'className') {
      const existingStyle = props[targetProp];
      newProps[targetProp] = StyleSheet.flatten([StyleSheet.flatten(baseStyle), existingStyle]);
      delete newProps[sourceProp];
    } else {
      const clsName = props[sourceProp];
      if (clsName) {
        const parsed = parseClassNamesWithStates(clsName).normalStyle;
        const existing = props[targetProp];
        newProps[targetProp] = StyleSheet.flatten([parsed, existing]);
        delete newProps[sourceProp];
      }
    }
  }

  // Space helper mapping
  if (props.children && props.className) {
    newProps.children = applySpacingToChildren(props.children, props.className);
  }

  // Active pressed handling on Pressable elements
  if (Component === RNPressable) {
    return (
      <RNPressable
        {...newProps}
        style={(state: any) => {
          const pressed = state.pressed;
          const combined = [
            normalStyle,
            pressed && activeStyle,
            props.disabled && disabledStyle,
            typeof props.style === 'function' ? props.style(state) : props.style
          ];
          return StyleSheet.flatten(combined);
        }}
      />
    );
  }

  return <Component {...newProps} />;
}

// CSS-enabled Link
export const Link = (
  props: React.ComponentProps<typeof RouterLink> & { className?: string }
) => {
  return useCssElement(RouterLink, props, { className: "style" });
};

// CSS Variable hook (dummy/unused fallback)
export const useCSSVariable = (variable: string) => `var(${variable})`;

// View
export type ViewProps = React.ComponentProps<typeof RNView> & {
  className?: string;
};
export const View = (props: ViewProps) => {
  return useCssElement(RNView, props, { className: "style" });
};
View.displayName = "CSS(View)";

// Text
export type TextProps = React.ComponentProps<typeof RNText> & {
  className?: string;
};
export const Text = (props: TextProps) => {
  return useCssElement(RNText, props, { className: "style" });
};
Text.displayName = "CSS(Text)";

// ScrollView
export type ScrollViewProps = React.ComponentProps<typeof RNScrollView> & {
  className?: string;
  contentContainerClassName?: string;
};
export const ScrollView = (props: ScrollViewProps) => {
  return useCssElement(RNScrollView, props, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  });
};
ScrollView.displayName = "CSS(ScrollView)";

// Pressable
export type PressableProps = React.ComponentProps<typeof RNPressable> & {
  className?: string;
};
export const Pressable = (props: PressableProps) => {
  return useCssElement(RNPressable, props, { className: "style" });
};
Pressable.displayName = "CSS(Pressable)";

// TextInput
export type TextInputProps = React.ComponentProps<typeof RNTextInput> & {
  className?: string;
};
export const TextInput = (props: TextInputProps) => {
  return useCssElement(RNTextInput, props, { className: "style" });
};
TextInput.displayName = "CSS(TextInput)";

// AnimatedScrollView
export const AnimatedScrollView = (
  props: React.ComponentProps<typeof Animated.ScrollView> & {
    className?: string;
    contentClassName?: string;
    contentContainerClassName?: string;
  }
) => {
  return useCssElement(Animated.ScrollView as any, props as any, {
    className: "style",
    contentClassName: "contentContainerStyle",
    contentContainerClassName: "contentContainerStyle",
  });
};

// TouchableHighlight with underlayColor extraction
function XXTouchableHighlight(
  props: React.ComponentProps<typeof RNTouchableHighlight>
) {
  const { underlayColor, ...style } = (StyleSheet.flatten(props.style) as any) || {};
  return (
    <RNTouchableHighlight
      underlayColor={underlayColor}
      {...props}
      style={style}
    />
  );
}
export const TouchableHighlight = (
  props: React.ComponentProps<typeof RNTouchableHighlight>
) => {
  return useCssElement(XXTouchableHighlight, props, { className: "style" });
};
TouchableHighlight.displayName = "CSS(TouchableHighlight)";

// Animated components
export const AnimatedView = (
  props: React.ComponentProps<typeof Animated.View> & { className?: string }
) => {
  return useCssElement(Animated.View as any, props as any, { className: "style" });
};
AnimatedView.displayName = "CSS(Animated.View)";

// SafeAreaView
export type SafeAreaViewProps = React.ComponentProps<typeof RNSafeAreaView> & {
  className?: string;
};
export const SafeAreaView = (props: SafeAreaViewProps) => {
  return useCssElement(RNSafeAreaView, props, { className: "style" });
};
SafeAreaView.displayName = "CSS(SafeAreaView)";

// KeyboardAvoidingView
export const KeyboardAvoidingView = ((props: any) => {
  return useCssElement(RNKeyboardAvoidingView, props, { className: "style" });
}) as unknown as typeof RNKeyboardAvoidingView;

// FlatList
export const FlatList = React.forwardRef((props: any, ref: any) => {
  return useCssElement(RNFlatList, { ...props, ref }, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  });
}) as unknown as typeof RNFlatList;

// Dev builds, or a test release built with EXPO_PUBLIC_DEV_TOOLS=1.
export const DEV_TOOLS = __DEV__ || process.env.EXPO_PUBLIC_DEV_TOOLS === '1';

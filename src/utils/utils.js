export const updateNestedConfig = (configs, route, value) => {
  if (route.length === 0) return { ...configs, value };
  let _route = [...route];
  const key = _route.shift();
  if (key in configs) return { ...configs, [key]: updateNestedConfig(configs[key], _route, value) };
};

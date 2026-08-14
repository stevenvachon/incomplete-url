export const PARAMS_METHODS_READONLY = [
  'entries',
  'forEach',
  'get',
  'getAll',
  'has',
  'keys',
  'toString',
  'values',
  Symbol.iterator,
] as const;

export const PARAMS_METHODS_WRITEONLY = ['append', 'delete', 'set', 'sort'] as const;

export const PARAMS_METHODS = [...PARAMS_METHODS_READONLY, ...PARAMS_METHODS_WRITEONLY] as const;

export const PARAMS_PROPERTIES = ['size', Symbol.toStringTag] as const;

export const URL_METHODS = ['toJSON', 'toString'] as const;

export const URL_PROPERTIES = [
  'hash',
  'host',
  'hostname',
  'href',
  'origin',
  'password',
  'pathname',
  'port',
  'protocol',
  'search',
  'searchParams',
  'username',
  Symbol.toStringTag,
] as const;

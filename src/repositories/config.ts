export const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE === 'mock'
  ? 'mock'
  : 'api';

export const isApiDataSource = dataSource === 'api';

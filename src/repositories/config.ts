export const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE === 'api'
  ? 'api'
  : 'mock';

export const isApiDataSource = dataSource === 'api';

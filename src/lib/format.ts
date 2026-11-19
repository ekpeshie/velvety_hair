const naira = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

export const money = (n: number) => naira.format(n);

export const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '');

import type { BoomReturnType } from './boom';

export interface RequestResponse<DataType, ErrorType> {
	data: DataType | null;
	error: ErrorType | null;
}

export async function request<DataType = unknown, ErrorType = BoomReturnType>(
	endpoint: string,
	method: 'post' | 'get' | 'put' | 'delete',
	body?: BodyInit,
	options: RequestInit = {}
): Promise<RequestResponse<DataType, ErrorType>> {
	try {
		const data = await fetch(endpoint, {
			...options,
			method,
			headers: {
				accept: 'application/json',
				'content-type': 'application/json',
				...options.headers
			},
			body
		});
		if (data.status >= 400 && data.status < 600) throw await data.json();
		return { data: await data.json(), error: null };
	} catch (error) {
		return { data: null, error: error as ErrorType };
	}
}

export async function post<DataType = unknown, ErrorType = BoomReturnType>(
	endpoint: string,
	body: BodyInit,
	options: RequestInit = {}
) {
	return request<DataType, ErrorType>(endpoint, 'post', body, options);
}

export async function del<DataType = unknown, ErrorType = BoomReturnType>(
	endpoint: string,
	body: BodyInit,
	options: RequestInit = {}
) {
	return request<DataType, ErrorType>(endpoint, 'delete', body, options);
}

export async function put<DataType = unknown, ErrorType = BoomReturnType>(
	endpoint: string,
	body: BodyInit,
	options: RequestInit = {}
) {
	return request<DataType, ErrorType>(endpoint, 'put', body, options);
}

export async function get<DataType = unknown, ErrorType = BoomReturnType>(
	endpoint: string,
	body?: URLSearchParams,
	options: RequestInit = {}
) {
	return request<DataType, ErrorType>(
		`${endpoint}${body ? `?${body.toString()}` : ''}`,
		'get',
		undefined,
		options
	);
}

// http://localhost:9000/peerjs/peers
export function getEndpoint() {
	return `${location.protocol}//${location.hostname}:9000/peerjs`;
}

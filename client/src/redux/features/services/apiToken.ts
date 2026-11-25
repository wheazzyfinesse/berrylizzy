// redux/apiToken.ts
type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter = async () => null;

export const setApiTokenGetter = (getter: TokenGetter | null) => {
	tokenGetter = getter ?? (async () => null);
};

export const getApiToken = () => tokenGetter();

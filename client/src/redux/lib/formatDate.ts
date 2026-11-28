const formatDate = (dateString: string) => {
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	};
	return new Date(dateString).toLocaleDateString(undefined, options);
};

export default formatDate;

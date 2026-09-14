export function normalizeCategoryQuery(value = "") {
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[_/\\&+()]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function filterProfilesByCategory(query, profiles = []) {
    const normalizedQuery = normalizeCategoryQuery(query);
    if (!normalizedQuery) {
        return [];
    }

    const queryTokens = normalizedQuery.split(" ").filter(Boolean);
    return profiles.filter((profile) => {
        const categoriesText = (profile.categories || [])
            .map((category) => normalizeCategoryQuery(category))
            .join(" ");

        if (!categoriesText) {
            return false;
        }

        return queryTokens.every((token) => categoriesText.includes(token));
    });
}

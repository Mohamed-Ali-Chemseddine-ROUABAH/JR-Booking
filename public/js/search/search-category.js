import { collection, getDocs, limit, query } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { filterProfilesByCategory, normalizeCategoryQuery } from "./category-search-utils.mjs";

export async function findPublicProfilesByCategory(searchTerm) {
    const normalizedTerm = normalizeCategoryQuery(searchTerm);
    if (!normalizedTerm) {
        return [];
    }

    const database = getFirestoreDb();
    if (!database) {
        return [];
    }

    const snapshot = await getDocs(query(collection(database, "publicProfiles"), limit(100)));
    const profiles = snapshot.docs.map((documentSnapshot) => ({ id: documentSnapshot.id, ...documentSnapshot.data() }));
    return filterProfilesByCategory(normalizedTerm, profiles);
}

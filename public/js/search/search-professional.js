import { collection, getDocs, limit, query } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { normalizeSearchTerm } from "../core/utils.js";

export async function findPublicProfiles(searchTerm) {
    const normalizedTerm = normalizeSearchTerm(searchTerm);
    if (!normalizedTerm) {
        return [];
    }

    const database = getFirestoreDb();
    if (!database) {
        return [];
    }

    const snapshot = await getDocs(query(collection(database, "publicProfiles"), limit(50)));
    return snapshot.docs
        .map((documentSnapshot) => ({ id: documentSnapshot.id, ...documentSnapshot.data() }))
        .filter((profile) => {
            const searchableText = [profile.displayName, profile.name, ...(profile.categories || [])]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("fr-FR");
            return searchableText.includes(normalizedTerm);
        });
}

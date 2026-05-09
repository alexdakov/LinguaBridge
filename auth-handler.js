
    // Import your config and Firebase functions
    import { auth } from "./firebase-config.js";
    import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
    import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

    const db = getFirestore();

    window.handleLogin = async () => {
        const nickname = document.getElementById('nickname').value.trim();
        const password = document.querySelector('input[type="password"]').value;

        // Convert nickname to the shadow email used in Firebase Auth
        const shadowEmail = `${nickname.toLowerCase()}@linguabridge.com`;

        try {
            // 1. Authenticate with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, shadowEmail, password);
            const user = userCredential.user;

            // 2. Fetch the role from the 'users' collection
            const userSnap = await getDoc(doc(db, "users", user.uid));

            if (userSnap.exists()) {
                const userData = userSnap.data();
                
                // 3. Route based on the role field in Firestore
                if (userData.role === "tutor") {
                    window.location.href = 'tutor-portal.html';
                } else {
                    window.location.href = 'student-portal.html';
                }
            } else {
                alert("No profile found for this user in Firestore.");
            }
        } catch (error) {
            console.error(error);
            alert("Login failed: " + error.message);
        }
    };
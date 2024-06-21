let tokenClient;

export function initializeAuth(CLIENT_ID, SCOPES, fetchSheetData) {
    google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => handleCredentialResponse(response, fetchSheetData),
    });
    document.getElementById('signin-button').onclick = () => google.accounts.id.prompt();
}

function handleCredentialResponse(response, fetchSheetData) {
    console.log("Credential response received:", response);
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
            if (tokenResponse.error) {
                console.error("Error receiving token response:", tokenResponse.error);
                return;
            }
            console.log("Token response received:", tokenResponse);
            localStorage.setItem('gapiToken', tokenResponse.access_token);
            fetchSheetData();
        },
    });
    tokenClient.requestAccessToken({ prompt: '' });
}

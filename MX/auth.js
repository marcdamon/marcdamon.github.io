export function initializeAuth(clientId, scopes, callback) {
    google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => handleCredentialResponse(response, callback),
    });
    document.getElementById('signin-button').onclick = () => google.accounts.id.prompt();
}

function handleCredentialResponse(response, callback) {
    console.log("Credential response received:", response);
    const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: response.client_id,
        scope: response.scope,
        callback: (tokenResponse) => {
            if (tokenResponse.error) {
                console.error("Error receiving token response:", tokenResponse.error);
                return;
            }
            console.log("Token response received:", tokenResponse);
            localStorage.setItem('gapiToken', tokenResponse.access_token);
            callback();
        },
    });
    tokenClient.requestAccessToken({ prompt: '' });
}

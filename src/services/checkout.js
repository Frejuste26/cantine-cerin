import axios from 'axios';

const API_URL = 'https://api.wave.com/v1/checkout/sessions';
const API_KEY = 'wave_ci_prod_gG3Ba6CcWRBNr1CBKDh2YseMcms1XsikRXwf3Yw3z4Lgwj6HqfDjxDiQpw4nT8JnApR8HR59MWxqrvwDNIYQRYmsfr-Atj8VuA';

export default {
    createCheckoutSession(amount) {
        const checkoutParams = {
            amount: amount.toString(),
            currency: 'XOF',
            error_url: window.location.origin + '/payment/error',
            success_url: window.location.origin + '/payment/success'
        };

        return axios.post(API_URL, checkoutParams, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            const waveUrl = response.data.wave_launch_url;
            window.location.href = waveUrl;
            return response.data;
        })
        .catch(error => {
            console.error('Erreur lors de la création de la session de paiement:', error);
            throw error;
        });
    }
}
const axios = require("axios");

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }

    try {
        const formData = JSON.parse(event.body);
        const { name, email, mobile, message } = formData;

        // Send email notification
        await sendEmailNotification({ name, email, mobile, message });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Form submission successful" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};

async function sendEmailNotification({ name, email, mobile, message }) {
    const netlifySiteName = process.env.NETLIFY_SITE_NAME;
    const netlifyFormsApiUrl = `https://api.netlify.com/api/v1/sites/${netlifySiteName}/forms`;

    const formData = {
        "form-name": "contact",
        name,
        email,
        mobile,
        message,
    };

    try {
        await axios.post(netlifyFormsApiUrl, formData);
    } catch (error) {
        console.error("Error sending email notification:", error);
    }
}

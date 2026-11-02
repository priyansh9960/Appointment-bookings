This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Doctor WhatsApp notifications

After a booking is created, the server sends the doctor a WhatsApp template message through the Meta WhatsApp Cloud API. Copy `.env.example` to `.env.local` and set the values from your Meta WhatsApp app:

- `META_WHATSAPP_ACCESS_TOKEN`: server-side access token
- `META_WHATSAPP_PHONE_NUMBER_ID`: WhatsApp Business phone number ID used to send messages
- `META_GRAPH_API_VERSION`: supported Graph API version, in the form `vXX.X`
- `DOCTOR_WHATSAPP_TO`: doctor's WhatsApp number with country code (for example, `919876543210`)
- `META_WHATSAPP_TEMPLATE_NAME` and `META_WHATSAPP_TEMPLATE_LANGUAGE`: approved message template name and language

Create and get approval for a WhatsApp template whose body has five text placeholders, in this order: patient name, appointment date, start time, patient phone number, and booking reference. Meta may not allow a business-initiated message without an approved template. Keep the access token private; do not use a `NEXT_PUBLIC_` variable for it.

The confirmation page reports whether Meta accepted the notification request or the reason it could not be sent. This does not confirm delivery to the doctor's device. Appointment data is currently held in an in-memory store, so it is lost when the server restarts and is not suitable for production deployment.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

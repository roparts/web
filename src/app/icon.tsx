import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    backgroundColor: 'transparent',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 400 400"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M200 20L46.4 110V290L200 380L353.6 290V110L200 20Z"
                        stroke="#0F172A"
                        stroke-width="25"
                        stroke-linejoin="round"
                    />
                    <path
                        d="M200 50L72.4 125V275L200 350L327.6 275V125L200 50Z"
                        stroke="#0F172A"
                        stroke-width="15"
                        stroke-linejoin="round"
                    />
                    <circle cx="200" cy="200" r="105" fill="#7C3AED" />
                    <path
                        d="M200 120C200 120 140 190 140 230C140 263.137 166.863 290 200 290C233.137 290 260 263.137 260 230C260 190 200 120 200 120Z"
                        fill="white"
                    />
                </svg>
            </div>
        ),
        {
            ...size,
        }
    )
}

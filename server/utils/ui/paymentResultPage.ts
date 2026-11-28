const escapeHtml = (value: string) =>
	value.replace(/[&<>"']/g, (character) => {
		const entities: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		};

		return entities[character] ?? character;
	});

export const paymentResultPage = (title: string, message: string) => {
	const safeTitle = escapeHtml(title);
	const safeMessage = escapeHtml(message);

	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#6d284f" />
    <title>${safeTitle} | BerryLizzy</title>
    <style>
      * {
        box-sizing: border-box;
      }

      body {
        min-height: 100vh;
        margin: 0;
        padding: 24px;
        display: grid;
        place-items: center;
        background:
          radial-gradient(ellipse at top left, #fce8f0 0, transparent 48%),
          #f8f5f7;
        color: #30232b;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .card {
        width: min(100%, 440px);
        padding: 36px 28px;
        border: 1px solid #f0e5eb;
        border-radius: 24px;
        background: #fff;
        box-shadow: 0 20px 60px rgba(70, 31, 53, 0.12);
        text-align: center;
      }

      .brand {
        margin-bottom: 28px;
        color: #6d284f;
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 0.14em;
      }

      .icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 20px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: #f8eaf1;
        color: #8b3767;
        font-size: 28px;
      }

      h1 {
        margin: 0 0 12px;
        color: #3d2635;
        font-size: clamp(24px, 7vw, 30px);
        line-height: 1.2;
      }

      .message {
        margin: 0;
        color: #6c5b66;
        font-size: 16px;
        line-height: 1.6;
      }

      .return-note {
        margin-top: 28px;
        padding: 14px 16px;
        border-radius: 14px;
        background: #faf5f8;
        color: #6d284f;
        font-size: 14px;
        line-height: 1.5;
      }

      .footer {
        margin: 24px 0 0;
        color: #9b8b95;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="brand">BERRYLIZZY</div>
      <div class="icon" aria-hidden="true">♥</div>
      <h1>${safeTitle}</h1>
      <p class="message">${safeMessage}</p>
      <div class="return-note">
        Return to the BerryLizzy app to view your order and its latest status.
      </div>
      <p class="footer">Thank you for shopping with BerryLizzy</p>
    </main>
  </body>
</html>`;
};

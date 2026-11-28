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

export const paymentResultPage = (title: string, message: string) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#6d284f" />
    <title>${escapeHtml(title)} | BerryLizzy</title>
  </head>
  <body
    style="
      min-height: 100vh;
      margin: 0;
      padding: 24px;
      display: grid;
      place-items: center;
      box-sizing: border-box;
      background: #f8f5f7;
      color: #30232b;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    "
  >
    <main
      style="
        width: 100%;
        max-width: 440px;
        padding: 36px 28px;
        box-sizing: border-box;
        border: 1px solid #f0e5eb;
        border-radius: 24px;
        background: #ffffff;
        box-shadow: 0 20px 60px rgba(70, 31, 53, 0.12);
        text-align: center;
      "
    >
      <div
        style="
          margin-bottom: 28px;
          color: #6d284f;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.14em;
        "
      >
        BERRYLIZZY
      </div>

      <div
        aria-hidden="true"
        style="
          width: 64px;
          height: 64px;
          margin: 0 auto 20px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #f8eaf1;
          color: #8b3767;
          font-size: 28px;
        "
      >
        ♥
      </div>

      <h1
        style="
          margin: 0 0 12px;
          color: #3d2635;
          font-size: 28px;
          line-height: 1.2;
        "
      >
        ${escapeHtml(title)}
      </h1>

      <p
        style="
          margin: 0;
          color: #6c5b66;
          font-size: 16px;
          line-height: 1.6;
        "
      >
        ${escapeHtml(message)}
      </p>

      <div
        style="
          margin-top: 28px;
          padding: 14px 16px;
          border-radius: 14px;
          background: #faf5f8;
          color: #6d284f;
          font-size: 14px;
          line-height: 1.5;
        "
      >
        Return to the BerryLizzy app to view your order and its latest status.
      </div>

      <p
        style="
          margin: 24px 0 0;
          color: #9b8b95;
          font-size: 12px;
        "
      >
        Thank you for shopping with BerryLizzy
      </p>
    </main>
  </body>
</html>`;

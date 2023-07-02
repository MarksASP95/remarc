export const basicTemplate = (...content: string[]): string => {
  return `
  <html lang="en">
    <body>
      ${content.join("")}
    </body>
  </html>
  `
}
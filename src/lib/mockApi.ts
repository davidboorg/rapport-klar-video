
// Mock API för demo av workflow
export async function mockProcessFile(file: File): Promise<string> {
  await new Promise(res => setTimeout(res, 1500));
  return `Detta är ett exempel på manus genererat från rapporten "${file.name}".

Inledning:
Vårt företag har haft ett fantastiskt kvartal med stark tillväxt inom alla segment.

Huvudresultat:
- Omsättningen ökade med 25% jämfört med förra året
- Lönsamheten förbättrades betydligt
- Vi lanserade tre nya produkter

Framtidsutsikter:
Vi ser fortsatt stark efterfrågan och optimistiska utsikter för nästa kvartal.

Avslutning:
Tack för er uppmärksamhet och ert fortsatta förtroende.`;
}

export async function mockGenerateAudio(script: string): Promise<string> {
  await new Promise(res => setTimeout(res, 1200));
  return '/placeholder.mp3';
}

export async function mockGenerateVideo(script: string): Promise<string> {
  await new Promise(res => setTimeout(res, 1800));
  return '/placeholder.mp4';
}


interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
}

export const searchLocations = async (query: string): Promise<{ name: string; lat: number; lon: number }[]> => {
  if (!query || query.length < 3) return [];

  try {
    // Using OpenStreetMap Nominatim API
    // Note: specific user-agent or email is recommended for heavy usage, but standard fetch works for demo
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8' // Prioritize English/Arabic based on context ideally
        }
      }
    );

    if (!response.ok) throw new Error('Network response was not ok');

    const data: NominatimResult[] = await response.json();

    // Map to a simpler format
    return data.map((item) => {
      // Simplify the display name (take first 3 parts usually: Name, City, Country)
      const shortName = item.display_name.split(',').slice(0, 3).join(', ');
      
      return {
        name: shortName || item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      };
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
};

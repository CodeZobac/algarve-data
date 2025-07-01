import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const KEYWORDS_FILE_PATH = path.join(process.cwd(), 'data', 'tour_keywords.txt');

async function logKeywords(keywords: string) {
  if (keywords) {
    try {
      await fs.appendFile(KEYWORDS_FILE_PATH, `${keywords}\n`);
    } catch (error) {
      console.error('Failed to log keywords:', error);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { city, keywords } = await req.json();

    if (!city) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 });
    }

    await logKeywords(keywords);

    const searchQuery = `tourist attractions in ${city} ${keywords || ''}`.trim();
    const placesApiKey = process.env.GOOGLE_PLACES_API_KEY;

    interface Place {
      place_id: string;
      name: string;
    }

    let allPlaces: Place[] = [];
    let nextPageToken: string | null = null;

    do {
      const searchResponse: { data: { results: Place[]; next_page_token: string | null } } = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params: {
          query: searchQuery,
          key: placesApiKey,
          pagetoken: nextPageToken,
        },
      });

      allPlaces = allPlaces.concat(searchResponse.data.results);
      nextPageToken = searchResponse.data.next_page_token;

      if (nextPageToken) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } while (nextPageToken);

    const detailedPlaces = await Promise.all(
      allPlaces.map(async (place: { place_id: string; name: string }) => {
        const detailsResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
          params: {
            place_id: place.place_id,
            fields: 'name,formatted_address,formatted_phone_number,website',
            key: placesApiKey,
          },
        });
        const details = detailsResponse.data.result;
        return {
          companyName: details.name,
          placeOfActivity: place.name,
          address: details.formatted_address,
          contact: details.formatted_phone_number || details.website || 'N/A',
          city: city,
        };
      })
    );

    return NextResponse.json(detailedPlaces);
  } catch (error) {
    console.error('Error fetching tourist attractions:', error);
    return NextResponse.json({ error: 'Failed to fetch tourist attractions' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { region } = await req.json();

    if (!region) {
      return NextResponse.json(
        { error: "Region is required" },
        { status: 400 }
      );
    }

    const searchParams = new URLSearchParams({
      query: `restaurants in ${region}`,
      key: process.env.GOOGLE_PLACES_API_KEY!,
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?${searchParams}`
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Google Places API error:", error);
      return NextResponse.json(
        { error: "Failed to fetch data from Google Places API" },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const restaurants = data.results.map(
        (place: {
          name: string;
          photos: { photo_reference: string }[];
          formatted_phone_number: string;
          website: string;
          formatted_address: string;
          geometry: { location: { lat: number; lng: number } };
        }) => ({
          id: randomUUID(),
          name: place.name,
          photo:
            place.photos && place.photos.length > 0
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
              : null,
          contact: {
            phone: place.formatted_phone_number,
            website: place.website,
          },
          location: {
            address: place.formatted_address,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          },
        })
      );

      for (const restaurant of restaurants) {
        const { error } = await supabase
          .from("restaurants")
          .upsert(restaurant, { onConflict: "name" });

        if (error) {
          console.error("Supabase error:", error);
        }
      }
    }

    return NextResponse.json({ message: "Restaurants updated successfully" });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .not("location", "is", null);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch restaurants" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

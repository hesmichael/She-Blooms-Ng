import { mutation } from "./_generated/server";

export const seedInitialData = mutation({
  handler: async (ctx) => {
    const results: Record<string, number> = {};

    // 1. Seed Events
    const existingEvents = await ctx.db.query("events").take(1);
    if (existingEvents.length === 0) {
      const initialEvents = [
        {
          title: "The Art of Rest: A Slow Saturday Gathering",
          category: "Experience",
          date: "Saturday, 28 March 2026",
          time: "11:00 AM – 3:30 PM",
          location: "Ikoyi, Lagos",
          price: "₦35,000",
          description: "An intimate, unhurried day designed for women seeking deep restoration, curated conversation, sound healing, and nourishing seasonal cuisine.",
          whatToExpect: "Breathwork session, communal luncheon, gentle reflection circles, and intentional quietude.",
          status: "Available",
          registrationDeadline: "25 March 2026",
          dressCode: "Comfortable linens, breathable natural tones",
          whatIsIncluded: "Sound bath, gourmet lunch, welcome herbal tea, guided reflection workbook",
          whatToBring: "An open heart and your favourite journal",
          isPast: false,
          image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80",
          createdAt: new Date().toISOString(),
        },
        {
          title: "Women, Wealth & Intentional Investing",
          category: "Learning",
          date: "Thursday, 16 April 2026",
          time: "6:00 PM – 8:30 PM",
          location: "Victoria Island, Lagos & Virtual",
          price: "₦20,000",
          description: "A candid, jargon-free Masterclass examining personal capital, wealth preservation, alternative investments, and financial autonomy.",
          whatToExpect: "Keynote presentation, interactive portfolio worksheets, Q&A with top female fund managers.",
          status: "Available",
          registrationDeadline: "14 April 2026",
          dressCode: "Smart casual / business chic",
          whatIsIncluded: "Cocktail reception, workbook, financial strategy templates",
          whatToBring: "Notepad or tablet",
          isPast: false,
          image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
          createdAt: new Date().toISOString(),
        },
        {
          title: "Quarterly Book Salon: The House of Rust",
          category: "Books",
          date: "Saturday, 9 May 2026",
          time: "4:00 PM – 7:00 PM",
          location: "Private Salon, Ikeja GRA",
          price: "Free for Members",
          description: "A warm gathering exploring Khadija Abdalla Bajaber's atmospheric novel, accompanied by artisanal tea and open literary dialogue.",
          whatToExpect: "Literary discussion, discussion prompts, tea and pastries, book swap corner.",
          status: "Available",
          registrationDeadline: "5 May 2026",
          dressCode: "Casual elegance",
          whatIsIncluded: "Handcrafted teas, artisanal pastries, discussion notes",
          whatToBring: "Your copy of the book",
          isPast: false,
          image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
          createdAt: new Date().toISOString(),
        },
      ];

      for (const event of initialEvents) {
        await ctx.db.insert("events", event);
      }
      results.events = initialEvents.length;
    }

    // 2. Seed Books
    const existingBooks = await ctx.db.query("books").take(1);
    if (existingBooks.length === 0) {
      const initialBooks = [
        {
          title: "The House of Rust",
          author: "Khadija Abdalla Bajaber",
          discussionDate: "Saturday, 9 May 2026",
          format: "In-Person Salon & Virtual Room",
          introduction: "A mythical journey of a young Hadrami girl in Mombasa who embarks on a quest into the sea to rescue her fisherman father.",
          coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
          isCurrent: true,
        },
        {
          title: "Rest Is Resistance: A Manifesto",
          author: "Tricia Hersey",
          discussionDate: "Saturday, 21 February 2026",
          format: "In-Person Gathering",
          introduction: "An exploration of rest as a radical act of liberation, reimagining our relationship with productivity culture.",
          coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
          isCurrent: false,
        },
      ];

      for (const book of initialBooks) {
        await ctx.db.insert("books", book);
      }
      results.books = initialBooks.length;
    }

    // 3. Seed Conference Speakers
    const existingSpeakers = await ctx.db.query("conferenceSpeakers").take(1);
    if (existingSpeakers.length === 0) {
      const initialSpeakers = [
        {
          name: "Dr. Joanne Aizobu",
          role: "Founder & Executive Director",
          organization: "SheBlooms Network",
          location: "Lagos, Nigeria",
          bio: "Passionate about women's holistic well-being, community leadership, and fostering transformative spaces for professional and personal growth.",
          photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
          isConfirmed: true,
          order: 1,
        },
        {
          name: "Amara Okonkwo",
          role: "Managing Partner & Angel Investor",
          organization: "Veritas Ventures",
          location: "London & Lagos",
          bio: "Pioneering investment in female-led enterprises and sustainable consumer innovations across the continent.",
          photo: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80",
          isConfirmed: true,
          order: 2,
        },
      ];

      for (const speaker of initialSpeakers) {
        await ctx.db.insert("conferenceSpeakers", speaker);
      }
      results.conferenceSpeakers = initialSpeakers.length;
    }

    // 4. Seed Conference Agenda
    const existingAgenda = await ctx.db.query("conferenceAgenda").take(1);
    if (existingAgenda.length === 0) {
      const initialAgenda = [
        {
          time: "09:00 AM – 10:00 AM",
          title: "Registration, Artisanal Breakfast & Networking Lounge",
          description: "Welcome refreshments, badge pickup, and guided connection prompts.",
          highlight: false,
          order: 1,
        },
        {
          time: "10:00 AM – 11:30 AM",
          title: "Opening Keynote: Redefining Authority & Grace in Modern Leadership",
          description: "An evocative talk on sustaining balance, influence, and purpose.",
          highlight: true,
          order: 2,
        },
        {
          time: "11:45 AM – 01:15 PM",
          title: "Panel Session: Building Multi-Generational Wealth & Legacy",
          description: "Practical discussions with wealth advisors and institutional founders.",
          highlight: false,
          order: 3,
        },
      ];

      for (const agenda of initialAgenda) {
        await ctx.db.insert("conferenceAgenda", agenda);
      }
      results.conferenceAgenda = initialAgenda.length;
    }

    return {
      status: "ok",
      message: "Seed data successfully populated in Convex Cloud tables.",
      results,
    };
  },
});

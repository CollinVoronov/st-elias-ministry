import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@sainteliaschurch.org" },
    update: {},
    create: {
      email: "admin@sainteliaschurch.org",
      name: "Admin",
      role: "ADMIN",
    },
  });

  console.log("Created admin user:", admin.email);

  // Create ministries
  const outreach = await prisma.ministry.upsert({
    where: { name: "Community Outreach" },
    update: {},
    create: {
      name: "Community Outreach",
      description: "Serving our neighbors in Austin through direct community engagement.",
      color: "#4263eb",
    },
  });

  const youth = await prisma.ministry.upsert({
    where: { name: "Youth Ministry" },
    update: {},
    create: {
      name: "Youth Ministry",
      description: "Empowering young people to serve and grow in faith.",
      color: "#f59f00",
    },
  });

  const care = await prisma.ministry.upsert({
    where: { name: "Care Ministry" },
    update: {},
    create: {
      name: "Care Ministry",
      description: "Providing support and care to those in need.",
      color: "#e64980",
    },
  });

  console.log("Created ministries");

  // Create sample events
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(9, 0, 0, 0);

  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setHours(13, 0, 0, 0);

  const twoWeeks = new Date();
  twoWeeks.setDate(twoWeeks.getDate() + 14);
  twoWeeks.setHours(10, 0, 0, 0);

  const threeWeeks = new Date();
  threeWeeks.setDate(threeWeeks.getDate() + 21);
  threeWeeks.setHours(8, 0, 0, 0);

  const event1 = await prisma.event.create({
    data: {
      title: "Community Garden Cleanup",
      description:
        "Join us for our monthly community garden cleanup! We'll be weeding, planting new vegetables, and preparing garden beds for the spring season. All ages are welcome — bring your gardening gloves and a water bottle.\n\nLunch will be provided for all volunteers.",
      date: nextWeek,
      endDate: nextWeekEnd,
      location: "St. Elias Community Garden",
      address: "408 East 11th Street, Austin, TX 78701",
      status: "PUBLISHED",
      maxVolunteers: 25,
      whatToBring: ["Gardening gloves", "Water bottle", "Sunscreen", "Hat"],
      organizerId: admin.id,
      ministryId: outreach.id,
    },
  });

  // Add roles to event 1
  await prisma.eventRole.createMany({
    data: [
      { eventId: event1.id, name: "Team Lead", spotsNeeded: 2 },
      { eventId: event1.id, name: "Garden Crew", spotsNeeded: 15 },
      { eventId: event1.id, name: "Lunch Setup", spotsNeeded: 4 },
    ],
  });

  const event2 = await prisma.event.create({
    data: {
      title: "Youth Tutoring Program",
      description:
        "Help local students succeed! Our weekly tutoring program pairs church volunteers with students from nearby schools who need extra support in math, reading, and science.\n\nNo teaching experience required — just a willingness to help!",
      date: twoWeeks,
      location: "St. Elias Parish Hall",
      address: "408 East 11th Street, Austin, TX 78701",
      status: "PUBLISHED",
      maxVolunteers: 15,
      whatToBring: ["Laptop (optional)", "Pencils and paper"],
      organizerId: admin.id,
      ministryId: youth.id,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: "Food Drive Collection Day",
      description:
        "We are collecting non-perishable food items for the Austin Food Bank. Volunteers are needed to sort donations, pack boxes, and load the delivery truck.\n\nEvery canned good, every box of cereal, every bag of rice makes a difference for families in our community.",
      date: threeWeeks,
      location: "St. Elias Church Parking Lot",
      address: "408 East 11th Street, Austin, TX 78701",
      status: "PUBLISHED",
      maxVolunteers: 30,
      whatToBring: ["Comfortable shoes", "Work gloves"],
      organizerId: admin.id,
      ministryId: care.id,
    },
  });

  console.log("Created sample events");

  // Create sample volunteers and RSVPs
  const vol1 = await prisma.volunteer.create({
    data: { name: "Maria Garcia", email: "maria@example.com", phone: "(512) 555-0101" },
  });
  const vol2 = await prisma.volunteer.create({
    data: { name: "James Wilson", email: "james@example.com", phone: "(512) 555-0102" },
  });
  const vol3 = await prisma.volunteer.create({
    data: { name: "Sarah Chen", email: "sarah@example.com" },
  });

  await prisma.eventRSVP.createMany({
    data: [
      { volunteerId: vol1.id, eventId: event1.id, status: "CONFIRMED" },
      { volunteerId: vol2.id, eventId: event1.id, status: "CONFIRMED" },
      { volunteerId: vol3.id, eventId: event2.id, status: "CONFIRMED" },
      { volunteerId: vol1.id, eventId: event3.id, status: "CONFIRMED" },
    ],
  });

  console.log("Created sample volunteers and RSVPs");

  // Create sample ideas
  await prisma.idea.createMany({
    data: [
      {
        title: "Monthly Neighborhood Walk & Clean",
        description:
          "We could organize a monthly walk through nearby neighborhoods to pick up litter and beautify the area. It's a great way to meet neighbors, get exercise, and keep Austin clean!",
        submitterName: "Maria Garcia",
        submitterEmail: "maria@example.com",
        status: "APPROVED",
      },
      {
        title: "Holiday Care Packages for Elderly",
        description:
          "During the holiday season, we could put together care packages for elderly community members who live alone — including homemade cookies, warm socks, and handwritten cards from our youth group.",
        submitterName: "James Wilson",
        submitterEmail: "james@example.com",
        status: "SUBMITTED",
      },
    ],
  });

  console.log("Created sample ideas");

  // Create announcement
  await prisma.announcement.create({
    data: {
      title: "Spring Service Season",
      body: "Our spring community service season kicks off next week! Check out our upcoming events and sign up to volunteer.",
      isPinned: true,
      authorId: admin.id,
    },
  });

  console.log("Created sample announcement");
  console.log("Seed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

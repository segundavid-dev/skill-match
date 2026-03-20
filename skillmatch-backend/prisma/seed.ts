import { PrismaClient, Role, LocationType, OpportunityStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding SkillMatch database...');

  // ── Skills ──────────────────────────────────────────────────────────────
  const skillNames = [
    'Teaching', 'Graphic Design', 'Coding', 'Fundraising',
    'Event Planning', 'Translation', 'Photography', 'Writing',
    'Legal Aid', 'Medical', 'Mentoring', 'Social Media',
    'Data Analysis', 'Music', 'Sports Coaching',
  ];

  const skills = await Promise.all(
    skillNames.map((name) =>
      prisma.skill.upsert({
        where: { name },
        update: {},
        create: { name, category: 'General' },
      })
    )
  );

  const skillMap = Object.fromEntries(skills.map((s) => [s.name, s]));
  console.log(`  ✓ ${skills.length} skills`);

  // ── Organizations ────────────────────────────────────────────────────────
  const orgData = [
    {
      email: 'admin@greenearth.org',
      name: 'Green Earth Foundation',
      mission: 'Protecting the planet one community at a time through environmental volunteering.',
      causeTags: ['Environment', 'Community'],
      verifiedBadge: true,
    },
    {
      email: 'admin@brightminds.org',
      name: 'Bright Minds Academy',
      mission: 'Empowering underserved youth through education and mentorship.',
      causeTags: ['Education', 'Youth'],
      verifiedBadge: true,
    },
    {
      email: 'admin@healthbridge.org',
      name: 'Health Bridge NGO',
      mission: 'Bridging health inequalities across rural communities in Africa.',
      causeTags: ['Health', 'Poverty'],
      verifiedBadge: false,
    },
  ];

  const orgs: { userId: string; orgId: string }[] = [];

  for (const o of orgData) {
    const hash = await bcrypt.hash('Password123!', 12);
    const user = await prisma.user.upsert({
      where: { email: o.email },
      update: {},
      create: {
        email: o.email,
        password: hash,
        role: Role.ORGANIZATION,
        verified: true,
        orgProfile: {
          create: {
            name: o.name,
            mission: o.mission,
            causeTags: o.causeTags,
            verifiedBadge: o.verifiedBadge,
          },
        },
      },
      include: { orgProfile: true },
    });
    orgs.push({ userId: user.id, orgId: user.orgProfile!.id });
  }

  console.log(`  ✓ ${orgs.length} organizations`);

  // ── Volunteers ───────────────────────────────────────────────────────────
  const volunteerData = [
    { email: 'alex@example.com', fullName: 'Alex Johnson', location: 'Lagos, Nigeria', skills: ['Coding', 'Data Analysis'], causes: ['Environment', 'Education'], availability: ['weekends', 'evenings'] },
    { email: 'fatima@example.com', fullName: 'Fatima Al-Hassan', location: 'Abuja, Nigeria', skills: ['Graphic Design', 'Social Media'], causes: ['Health', 'Youth'], availability: ['weekdays'] },
    { email: 'chidi@example.com', fullName: 'Chidi Nwosu', location: 'Lagos, Nigeria', skills: ['Teaching', 'Mentoring'], causes: ['Education', 'Youth'], availability: ['weekends', 'flexible'] },
    { email: 'amara@example.com', fullName: 'Amara Osei', location: 'Remote', skills: ['Writing', 'Translation'], causes: ['Human Rights', 'Community'], availability: ['flexible'] },
    { email: 'samuel@example.com', fullName: 'Samuel Adeyemi', location: 'Port Harcourt, Nigeria', skills: ['Photography', 'Event Planning'], causes: ['Arts & Culture', 'Community'], availability: ['weekends'] },
  ];

  const volunteers: { userId: string; volId: string }[] = [];

  for (const v of volunteerData) {
    const hash = await bcrypt.hash('Password123!', 12);
    const user = await prisma.user.upsert({
      where: { email: v.email },
      update: {},
      create: {
        email: v.email,
        password: hash,
        role: Role.VOLUNTEER,
        verified: true,
        volunteerProfile: {
          create: {
            fullName: v.fullName,
            location: v.location,
            bio: `Passionate volunteer ready to make an impact with my ${v.skills[0]} skills.`,
            availability: v.availability,
            causes: v.causes,
            impactScore: Math.random() * 40 + 60,
            skills: {
              create: v.skills.map((sName) => ({
                skill: { connect: { id: skillMap[sName].id } },
              })),
            },
          },
        },
      },
      include: { volunteerProfile: true },
    });
    volunteers.push({ userId: user.id, volId: user.volunteerProfile!.id });
  }

  console.log(`  ✓ ${volunteers.length} volunteers`);

  // ── Opportunities ────────────────────────────────────────────────────────
  const oppData = [
    {
      orgIdx: 0,
      title: 'Deforestation Dashboard Developer',
      description: 'Build a real-time dashboard tracking deforestation across 3 continents. React + D3.js stack.',
      skills: ['Coding', 'Data Analysis'],
      locationType: LocationType.REMOTE,
      spotsNeeded: 2,
      impactMetric: '8,400 people protected',
    },
    {
      orgIdx: 0,
      title: 'Environmental Campaign Photographer',
      description: 'Document our conservation projects for social media campaigns and grant reports.',
      skills: ['Photography', 'Social Media'],
      locationType: LocationType.IN_PERSON,
      location: 'Lagos, Nigeria',
      spotsNeeded: 1,
      impactMetric: '50,000 social reach',
    },
    {
      orgIdx: 1,
      title: 'STEM Tutor for After-School Program',
      description: 'Weekly after-school coding workshops for underserved youth aged 10–16.',
      skills: ['Teaching', 'Mentoring', 'Coding'],
      locationType: LocationType.IN_PERSON,
      location: 'Lagos, Nigeria',
      spotsNeeded: 3,
      impactMetric: '200 students impacted',
    },
    {
      orgIdx: 1,
      title: 'Curriculum Content Writer',
      description: 'Develop engaging STEM learning materials for our digital learning platform.',
      skills: ['Writing', 'Teaching'],
      locationType: LocationType.REMOTE,
      spotsNeeded: 2,
      impactMetric: '5,000 learners reached',
    },
    {
      orgIdx: 1,
      title: 'Social Media Manager',
      description: 'Grow our online presence, create content calendars and run paid campaigns.',
      skills: ['Social Media', 'Graphic Design'],
      locationType: LocationType.REMOTE,
      spotsNeeded: 1,
      impactMetric: '100K new followers',
    },
    {
      orgIdx: 2,
      title: 'Health Campaign Graphic Designer',
      description: 'Design health awareness materials for rural clinics — posters, infographics, social assets.',
      skills: ['Graphic Design', 'Social Media'],
      locationType: LocationType.REMOTE,
      spotsNeeded: 2,
      impactMetric: '50,000 awareness reach',
    },
    {
      orgIdx: 2,
      title: 'Medical Data Analyst',
      description: 'Analyse patient outcome data to improve our telemedicine programs across 12 states.',
      skills: ['Data Analysis', 'Medical'],
      locationType: LocationType.REMOTE,
      spotsNeeded: 1,
      impactMetric: '12,000 patient records improved',
    },
    {
      orgIdx: 2,
      title: 'Community Health Event Coordinator',
      description: 'Plan and execute quarterly mobile health camps in rural communities.',
      skills: ['Event Planning', 'Medical'],
      locationType: LocationType.IN_PERSON,
      location: 'Abuja, Nigeria',
      spotsNeeded: 2,
      impactMetric: '3,000 free consultations',
    },
  ];

  for (const opp of oppData) {
    const org = orgs[opp.orgIdx];
    await prisma.opportunity.create({
      data: {
        orgId: org.orgId,
        title: opp.title,
        description: opp.description,
        locationType: opp.locationType,
        location: opp.location,
        spotsNeeded: opp.spotsNeeded,
        status: OpportunityStatus.ACTIVE,
        impactMetric: opp.impactMetric,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        requiredSkills: {
          create: opp.skills.map((sName) => ({
            skill: { connect: { id: skillMap[sName].id } },
          })),
        },
      },
    });
  }

  console.log(`  ✓ ${oppData.length} opportunities`);
  console.log('\n✅  Seed complete!');
  console.log('\n📧  Test accounts (all passwords: Password123!):');
  console.log('   Volunteers: alex@example.com, fatima@example.com, chidi@example.com');
  console.log('   Orgs:       admin@greenearth.org, admin@brightminds.org, admin@healthbridge.org');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

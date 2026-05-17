import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		unlisted: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),
		serif: z.boolean().optional().default(false),
		aiUsage: z
			.object({
				level: z.union([z.literal(0), z.literal(1), z.literal(2)]),
				description: z.string(),
			})
			.optional(),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
const specCollection = defineCollection({
	schema: z.object({
		title: z.string().optional().nullable(),
		description: z.string().optional().nullable(),
	}),
});
const guestsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		authorLink: z.string().optional().default(""),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		lang: z.string().optional().default(""),
		serif: z.boolean().optional().default(false),
	}),
});
export const collections = {
	posts: postsCollection,
	spec: specCollection,
	guests: guestsCollection,
};

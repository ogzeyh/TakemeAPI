import { Request, Response } from "express";
import { supabase } from "../supabase/supabaseClient.js";
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { Codes } from "../utils/codes.js";

const getAllUrlsSchema = z.object({
    urlIds: z.string()
        .transform((str) => str.split(','))
        .pipe(
            z.array(z.string().uuid('Invalid URL ID'))
        )
});

const getUrlByShortCodeSchema = z.object({
    shortCode: z.string('Short code must be a string')
})

const createUrlSchema = z.object({
    longUrl: z.string().url('Invalid URL format'),
});

const editUrlSchema = z.object({
    urlId: z.string().uuid('Invalid URL ID'),
    longUrl: z.string().url('Invalid URL format'),
});

const deleteUrlSchema = z.object({
    urlId: z.string().uuid('Invalid URL ID'),
})

async function generateShortCode() {
    while(true) {
        const shortCode = nanoid(6);
        const { data } = await supabase
            .from('urls')
            .select('id')
            .eq('shortCode', shortCode)
            .maybeSingle();
            
        if (!data) return shortCode;
    }
}

export const getAllUrls = async (req: Request, res: Response) => {
    const parsed = getAllUrlsSchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ code: Codes.INVALID_URL_FORMAT, message: parsed.error.issues });

    const urlIds = parsed.data.urlIds;

    try {
        const { data, error } = await supabase
            .from('urls')
            .select('*')
            .in('id', urlIds);

        if (error) return res.status(500).json({ code: Codes.DB_ERROR, message: error?.message });

        res.status(200).json({ code: Codes.SUCCESSFULL_GET_ALL_URLS, message: "URLs fetched successfully", data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: Codes.INTERNAL_ERROR, message: 'Internal server error' });
    }
}

export const getUrlByShortCode = async (req: Request, res: Response) => {
    const parsed = getUrlByShortCodeSchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ code: Codes.INVALID_SHORT_CODE, message: parsed.error.issues });

    const shortCode = parsed.data.shortCode;

    try {
        const { data, error } = await supabase
            .from('urls')
            .select('*')
            .eq('shortCode', shortCode)
            .single();

        if (error) return res.status(500).json({ code: Codes.DB_ERROR, message: error?.message });

        res.status(200).json({ code: Codes.SUCCESSFULL_GET_URL, message: "URL fetched successfully", data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: Codes.INTERNAL_ERROR, message: 'Internal server error' });
    }
}

export const createUrl = async (req: Request, res: Response) => {
    const parsed = createUrlSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ code: Codes.INVALID_URL_FORMAT, message: parsed.error.issues });

    const { longUrl } = parsed.data;

    try {
        const shortCode = await generateShortCode();

        const { data, error } = await supabase
            .from('urls')
            .insert({ longUrl, shortCode })
            .select()
            .single();

        if (error) return res.status(500).json({ code: Codes.DB_ERROR, message: error?.message });

        res.status(201).json({ code: Codes.SUCCESSFULL_CREATED_URL,  message: 'URL was shortened successfully', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: Codes.INTERNAL_ERROR, message: 'Internal server error' });
    }
}

export const editUrl = async (req: Request, res: Response) => {
    const parsed = editUrlSchema.safeParse({
        urlId: req.params.urlId,
        longUrl: req.body.longUrl
    });

    if (!parsed.success) return res.status(400).json({ code: Codes.INVALID_URL_FORMAT, message: parsed.error.issues });

    const { urlId, longUrl } = parsed.data;

    try {
        const { data, error } = await supabase
            .from('urls')
            .update({ longUrl })
            .eq('id', urlId)
            .select()
            .single();

        if (error) {
            if (error.code === "P2025" || error.details?.includes('not found')) return res.status(404).json({ code: Codes.NOT_FOUND, message: "URL not found"});
            return res.status(500).json({ code: Codes.DB_ERROR, message: error.message });
        }

        if (!data) return res.status(404).json({ code: Codes.NOT_FOUND, message: "URL not found" });

        res.status(200).json({ code: Codes.SUCCESSFULL_EDITED_URL, message: "URL was edited successfully", data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: Codes.INTERNAL_ERROR, message: 'Internal server error' });
    }
}

export const deleteUrl = async (req: Request, res: Response) => {
    const parsed = deleteUrlSchema.safeParse(req.params);

    if (!parsed.success) return res.status(400).json({ code: Codes.INVALID_URL_FORMAT, message: parsed.error.issues });

    const { urlId } = parsed.data;

    try {
        const { data: existing } = await supabase
            .from('urls')
            .select('id')
            .eq('id', urlId)
            .maybeSingle();

        if (!existing) return res.status(404).json({ code: Codes.NOT_FOUND, message: "URL not found" });

        const { error } = await supabase
            .from('urls')
            .delete()
            .eq('id', urlId);

        if (error) return res.status(500).json({ code: Codes.DB_ERROR, message: error.message });

        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: Codes.INTERNAL_ERROR, message: 'Internal server error' });
    }
}
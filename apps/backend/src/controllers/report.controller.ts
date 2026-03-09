import { Request, Response } from "express";
import { reportService } from "../services/report.service";

export const create_report = async (req: Request, res: Response) => {
    try {
        const { target_type, model_id, post_id, comment_id, reason } = req.body;
        const reporter_id = req.user!.id;

        if (!target_type || !reason) {
            return res.status(400).json({ message: "Target type and reason are required" });
        }

        const report = await reportService.createReport({
            reporter_id,
            target_type,
            model_id,
            post_id,
            comment_id,
            reason
        });

        res.status(201).json({ message: "Report created successfully", data: report });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const get_reports = async (req: Request, res: Response) => {
    try {
        const reports = await reportService.getAggregatedReports();
        res.status(200).json({ data: reports });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const dismiss_report = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await reportService.dismissReportsByTarget(id);
        res.status(200).json({ message: "Reports dismissed" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const delete_reported_content = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const type = req.params.type as string;
        await reportService.deleteContentByTarget(id, type as any);
        res.status(200).json({ message: "Content deleted and reports marked as reviewed" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

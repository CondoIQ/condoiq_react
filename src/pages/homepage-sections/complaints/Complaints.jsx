import React, { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Button,
    useTheme,
    useMediaQuery,
    Divider,
} from "@mui/material";
import {
    ReportProblem,
    Add,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import ComplaintList from "./ComplaintList";
import ComplaintDialog from "./ComplaintDialog";
import ComplaintDetailsDialog from "./ComplaintDetailsDialog";
import { useAuth } from "../../../hooks/useAuth";

const Complaints = () => {
    const { isAdmin, isBuildingManager, isSecurity } = useAuth();
    const [openDialog, setOpenDialog] = useState(false);
    const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const handleCreate = () => {
        setSelectedComplaint(null);
        setOpenDialog(true);
    };

    const handleEdit = (complaint) => {
        setSelectedComplaint(complaint);
        setOpenDialog(true);
    };

    const handleSaved = () => {
        setRefreshTrigger(prev => prev + 1);
        // Note: Dialog close is handled by the dialog itself calling onClose which triggers the setOpenDialog(false) passed to it.
        // But here we might want to ensure.
    };

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            sx={{
                width: "100%",
                minHeight: "calc(100vh - 100px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                p: isMobile ? 1.5 : 4,
            }}
        >
            <Paper
                sx={{
                    p: isMobile ? 2 : 4,
                    borderRadius: 4,
                    width: "100%",
                    maxWidth: 1600,
                    backgroundColor: "white",
                }}
            >
                {/* Header */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    mb={2}
                    gap={2}
                >
                    <Box display="flex" alignItems="center" gap={1}>
                        <ReportProblem sx={{ color: "primary.main", fontSize: 30 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Complaints & Maintenance
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={handleCreate}
                        sx={{ textTransform: "none", ml: "auto" }}
                    >
                        New Complaint
                    </Button>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <ComplaintList
                    onEdit={handleEdit}
                    onViewDetails={(complaint) => {
                        setSelectedComplaint(complaint);
                        setViewDetailsOpen(true);
                    }}
                    refreshTrigger={refreshTrigger}
                />

                <ComplaintDialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    complaint={selectedComplaint}
                    onComplaintSaved={handleSaved}
                />

                <ComplaintDetailsDialog
                    open={viewDetailsOpen}
                    onClose={() => setViewDetailsOpen(false)}
                    complaint={selectedComplaint}
                    onUpdate={handleSaved}
                />
            </Paper>
        </Box>
    );
};

export default Complaints;

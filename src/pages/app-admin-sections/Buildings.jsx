import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  TextField,
  TablePagination,
  TableSortLabel,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Refresh, Business, Search } from "@mui/icons-material";
import { motion } from "framer-motion";
import buildingService from "../../services/buildingService";
import debounce from "lodash.debounce";

const AllBuildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("buildingName");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await buildingService.getAllBuildings();
      setBuildings(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(err.message || "Failed to fetch buildings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  // ✅ Debounced search
  const handleSearch = useCallback(
    debounce((value) => setSearchTerm(value), 300),
    []
  );

  const filteredBuildings = useMemo(() => {
    if (!searchTerm) return buildings;
    return buildings.filter((b) =>
      b.buildingName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [buildings, searchTerm]);

  const sortedBuildings = useMemo(() => {
    const sorted = [...filteredBuildings];
    sorted.sort((a, b) => {
      const valA = a[orderBy] || "";
      const valB = b[orderBy] || "";
      return order === "asc"
        ? valA.toString().localeCompare(valB.toString())
        : valB.toString().localeCompare(valA.toString());
    });
    return sorted;
  }, [filteredBuildings, order, orderBy]);

  const visibleRows = useMemo(() => {
    return sortedBuildings.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [sortedBuildings, page, rowsPerPage]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
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
          backgroundColor: "white",
          width: "100%",
          maxWidth: 1500,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          mb={2}
          gap={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Business sx={{ color: "primary.main", fontSize: 32 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              All Buildings ({filteredBuildings.length})
            </Typography>
          </Box>
          <Box display="flex" gap={1} flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search buildings..."
              variant="outlined"
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Refresh">
              <IconButton onClick={fetchBuildings}>
                <Refresh color="primary" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : visibleRows.length === 0 ? (
          <Alert severity="info">No buildings found.</Alert>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: isMobile ? "60vh" : "70vh" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell
                      sortDirection={orderBy === "buildingName" ? order : false}
                    >
                      <TableSortLabel
                        active={orderBy === "buildingName"}
                        direction={order}
                        onClick={() => handleSort("buildingName")}
                      >
                        Building Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell
                      sortDirection={orderBy === "createdAt" ? order : false}
                    >
                      <TableSortLabel
                        active={orderBy === "createdAt"}
                        direction={order}
                        onClick={() => handleSort("createdAt")}
                      >
                        Created Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Total Floors</TableCell>
                    <TableCell>Total Units</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleRows.map((bldg, idx) => (
                    <TableRow key={bldg.buildingId} hover>
                      <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell>{bldg.buildingName}</TableCell>
                      <TableCell>{`${bldg.addressLine1}${
                        bldg.addressLine2 ? `, ${bldg.addressLine2}` : ""
                      }`}</TableCell>
                      <TableCell>{bldg.city}</TableCell>
                      <TableCell>
                        {new Date(bldg.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{bldg.totalFloors}</TableCell>
                      <TableCell>{bldg.totalUnits}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredBuildings.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(+e.target.value);
                setPage(0);
              }}
              rowsPerPageOptions={[5, 8, 10, 20]}
              sx={{ mt: 2 }}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AllBuildings;

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Refresh,
  Search,
  RoomPreferences,
  Add,
  Edit,
  Delete,
  EventNote,
  ListAlt,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";
import { useAuth } from "../../../hooks/useAuth";
import amenitiesService from "../../../services/amenitiesService";
import { getUserId } from "../../../services/authService";
import AmenityBookingDialog from "./AmenityBookingDialog";
import AmenityBookingDetailsDialog from "./AmenityBookingDetailsDialog";
import AmenityBookingList from "./AmenityBookingList";
import AmenityBookingCalendar from "./AmenityBookingCalendar";

const Amenities = () => {
  const { getBuildingId, isAdmin, isBuildingManager } = useAuth();
  const buildingId = getBuildingId();

  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(8);

  const [openDialog, setOpenDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [editAmenity, setEditAmenity] = useState(null);
  const [bookingAmenity, setBookingAmenity] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [viewBooking, setViewBooking] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Refs for instant, fast form handling
  const nameRef = useRef();
  const descRef = useRef();
  const priceRef = useRef();
  const openingRef = useRef();
  const closingRef = useRef();
  const isBookableRef = useRef();
  const isActiveRef = useRef();
  const maxCapacityRef = useRef();
  const minBookingDurationRef = useRef();
  const maxBookingDurationRef = useRef();
  const requiresApprovalRef = useRef();

  /** Fetch amenities **/
  const fetchAmenities = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await amenitiesService.getAllAmenities(buildingId);
      const amenitiesList = Array.isArray(data?.data) ? data.data : data;
      setAmenities(
        Array.isArray(amenitiesList) ? amenitiesList : [amenitiesList]
      );
    } catch (err) {
      setError(err.message || "Failed to load amenities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, [buildingId]);

  /** Debounced search **/
  const handleSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setPage(1);
    }, 300),
    []
  );

  /** Filter amenities **/
  const filteredAmenities = useMemo(() => {
    if (!searchTerm) return amenities;
    return amenities.filter((a) =>
      a.amenityName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [amenities, searchTerm]);

  /** Pagination **/
  const startIdx = (page - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const currentAmenities = filteredAmenities.slice(startIdx, endIdx);
  const totalPages = Math.ceil(filteredAmenities.length / rowsPerPage);

  /** Validate form **/
  const validateForm = () => {
    const errors = {};
    const name = nameRef.current.value.trim();
    const desc = descRef.current.value.trim();
    const price = parseFloat(priceRef.current.value);
    const opening = openingRef.current.value;
    const closing = closingRef.current.value;

    if (!name) errors.amenityName = "Amenity name is required";
    if (!desc) errors.description = "Description is required";
    if (isNaN(price)) errors.price = "Price is required";
    else if (price < 0) errors.price = "Price must be positive";
    if (!opening) errors.openingTime = "Opening time required";
    if (!closing) errors.closingTime = "Closing time required";
    if (opening && closing && opening >= closing)
      errors.closingTime = "Closing time must be after opening time";

    const maxCapacity = parseInt(maxCapacityRef.current.value);
    if (maxCapacityRef.current.value && (isNaN(maxCapacity) || maxCapacity < 1))
      errors.maxCapacity = "Capacity must be a positive number";

    const minDuration = parseFloat(minBookingDurationRef.current.value);
    const maxDuration = parseFloat(maxBookingDurationRef.current.value);

    if (minBookingDurationRef.current.value && (isNaN(minDuration) || minDuration < 0))
      errors.minBookingDuration = "Min duration must be positive";

    if (maxBookingDurationRef.current.value && (isNaN(maxDuration) || maxDuration < 0))
      errors.maxBookingDuration = "Max duration must be positive";

    if (!isNaN(minDuration) && !isNaN(maxDuration) && maxDuration < minDuration)
      errors.maxBookingDuration = "Max duration must be greater than min duration";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /** Create / Update Amenity **/
  const handleSaveAmenity = async (e) => {
    e.preventDefault();
    setCreateError("");
    if (!validateForm()) return;

    setCreating(true);
    try {
      const userId = getUserId();
      const payload = {
        buildingId,
        amenityName: nameRef.current.value,
        description: descRef.current.value,
        price: parseFloat(priceRef.current.value),
        openingTime: openingRef.current.value,
        closingTime: closingRef.current.value,
        isBookable: isBookableRef.current.checked,
        isActive: isActiveRef.current.checked,
        maxCapacity: maxCapacityRef.current.value ? parseInt(maxCapacityRef.current.value) : null,
        minBookingDuration: minBookingDurationRef.current.value ? parseFloat(minBookingDurationRef.current.value) : 0,
        maxBookingDuration: maxBookingDurationRef.current.value ? parseFloat(maxBookingDurationRef.current.value) : 0,
        requiresApproval: requiresApprovalRef.current.checked,
      };

      if (editAmenity) {
        payload.amenityId = editAmenity.amenityId;
        payload.createdBy = editAmenity.createdBy;
        payload.updatedBy = userId;

        await amenitiesService.updateAmenity(payload);
        setAmenities((prev) =>
          prev.map((a) => (a.amenityId === editAmenity.amenityId ? payload : a))
        );
      } else {
        payload.createdBy = userId;
        payload.updatedBy = userId;

        const created = await amenitiesService.createAmenity(payload);
        setAmenities((prev) => [created, ...prev]);
      }

      setOpenDialog(false);
      setEditAmenity(null);
      setFormErrors({});
    } catch (err) {
      setCreateError(err.message || "Operation failed");
    } finally {
      setCreating(false);
    }
  };

  /** Delete Amenity **/
  const handleDeleteAmenity = async (amenityId) => {
    if (!window.confirm("Are you sure you want to delete this amenity?"))
      return;
    try {
      await amenitiesService.deleteAmenity(amenityId);
      setAmenities((prev) => prev.filter((a) => a.amenityId !== amenityId));
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  /** Open Edit Dialog **/
  const handleEditAmenity = (amenity) => {
    setEditAmenity(amenity);
    setOpenDialog(true);

    // Wait for dialog + refs to mount before populating fields
    requestAnimationFrame(() => {
      if (!nameRef.current) return;

      nameRef.current.value = amenity.amenityName || "";
      descRef.current.value = amenity.description || "";
      priceRef.current.value = amenity.price ?? "";
      openingRef.current.value = amenity.openingTime
        ? amenity.openingTime.slice(0, 5)
        : "";
      closingRef.current.value = amenity.closingTime
        ? amenity.closingTime.slice(0, 5)
        : "";
      isBookableRef.current.checked = Boolean(amenity.isBookable);
      isActiveRef.current.checked = Boolean(amenity.isActive);
      if (maxCapacityRef.current) maxCapacityRef.current.value = amenity.maxCapacity || "";
      if (minBookingDurationRef.current) minBookingDurationRef.current.value = amenity.minBookingDuration || "";
      if (maxBookingDurationRef.current) maxBookingDurationRef.current.value = amenity.maxBookingDuration || "";
      if (requiresApprovalRef.current) requiresApprovalRef.current.checked = Boolean(amenity.requiresApproval);
    });
  };

  /** Reset form for new creation **/
  const handleCreateClick = () => {
    setEditAmenity(null);
    setOpenDialog(true);
    setTimeout(() => {
      if (!nameRef.current) return;
      nameRef.current.value = "";
      descRef.current.value = "";
      priceRef.current.value = "";
      openingRef.current.value = "";
      closingRef.current.value = "";
      isBookableRef.current.checked = false;
      isActiveRef.current.checked = true;
      if (maxCapacityRef.current) maxCapacityRef.current.value = "";
      if (minBookingDurationRef.current) minBookingDurationRef.current.value = "";
      if (maxBookingDurationRef.current) maxBookingDurationRef.current.value = "";
      if (requiresApprovalRef.current) requiresApprovalRef.current.checked = false;
    }, 60);
  };

  const handleBookClick = (amenity) => {
    setBookingAmenity(amenity);
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  /** Amenity Card **/
  const AmenityCard = React.memo(({ item }) => (
    <Box
      component={motion.div}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: "#fafafa",
        borderLeft: `5px solid ${item.isActive ? "#4caf50" : "#f44336"}`,
        boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
        mb: 2,
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: "primary.main" }}
        >
          {item.amenityName}
        </Typography>
        <Box display="flex" gap={1}>
          {(isAdmin() || isBuildingManager()) && (
            <>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => handleEditAmenity(item)}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteAmenity(item.amenityId)}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => handleBookClick(item)}
            disabled={!item.isBookable}
          >
            Book
          </Button>
        </Box>
      </Box>

      <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
        {item.description}
      </Typography>

      <Box sx={{ mt: 2, fontSize: 14 }}>
        <div>
          <strong>Bookable:</strong> {item.isBookable ? "Yes" : "No"}
        </div>
        <div>
          <strong>Status:</strong> {item.isActive ? "Active" : "Inactive"}
        </div>
        <div>
          <strong>Price:</strong> ${item.price?.toFixed(2) ?? "0.00"}
        </div>
        <div>
          <strong>Hours:</strong> {item.openingTime} - {item.closingTime}
        </div>
        {item.maxCapacity && (
          <div>
            <strong>Max Capacity:</strong> {item.maxCapacity}
          </div>
        )}
        {(item.minBookingDuration > 0 || item.maxBookingDuration > 0) && (
          <div>
            <strong>Duration:</strong> {item.minBookingDuration || 0}h - {item.maxBookingDuration || "∞"}h
          </div>
        )}
        <div>
          <strong>Approval Required:</strong> {item.requiresApproval ? "Yes" : "No"}
        </div>
      </Box>
    </Box>
  ));

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
            <RoomPreferences sx={{ color: "primary.main", fontSize: 30 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Amenities
            </Typography>
          </Box>

          <Tabs value={tabValue} onChange={handleTabChange} aria-label="amenities tabs">
            <Tab label="Amenities List" icon={<ListAlt />} iconPosition="start" />
            <Tab label="Bookings" icon={<EventNote />} iconPosition="start" />
          </Tabs>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Tab Panel 0: Amenities List */}
        {tabValue === 0 && (
          <>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Box display="flex" gap={1} flexWrap="wrap" width="100%">
                <TextField
                  size="small"
                  placeholder="Search amenities..."
                  variant="outlined"
                  onChange={(e) => handleSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flexGrow: 1, maxWidth: 400 }}
                />
                <Tooltip title="Refresh">
                  <IconButton onClick={fetchAmenities}>
                    <Refresh color="primary" />
                  </IconButton>
                </Tooltip>

                {(isAdmin() || isBuildingManager()) && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={handleCreateClick}
                    sx={{ textTransform: "none", ml: "auto" }}
                  >
                    Create Amenity
                  </Button>
                )}
              </Box>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : filteredAmenities.length === 0 ? (
              <Alert severity="info">No amenities found.</Alert>
            ) : (
              <>
                {currentAmenities.map((item) => (
                  <AmenityCard key={item.amenityId} item={item} />
                ))}
                {totalPages > 1 && (
                  <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(e, value) => setPage(value)}
                      color="primary"
                      size={isMobile ? "small" : "medium"}
                    />
                  </Box>
                )}
              </>
            )}
          </>
        )}

        {/* Tab Panel 1: Bookings */}
        {tabValue === 1 && (
          <Box>
            {(isAdmin() || isBuildingManager()) ? (
              <Box display="flex" flexDirection="column" gap={4}>
                <AmenityBookingList type="admin" onEdit={handleEditBooking} onViewDetails={setViewBooking} refreshTrigger={refreshTrigger} />
                <Divider />
                <AmenityBookingCalendar onViewDetails={setViewBooking} refreshTrigger={refreshTrigger} />
              </Box>
            ) : (
              <AmenityBookingList type="resident" onEdit={handleEditBooking} onViewDetails={setViewBooking} refreshTrigger={refreshTrigger} />
            )}
          </Box>
        )}

      </Paper>

      {/* Create / Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditAmenity(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editAmenity ? "Edit Amenity" : "Create New Amenity"}
        </DialogTitle>
        <DialogContent>
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createError}
            </Alert>
          )}
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              label="Amenity Name"
              inputRef={nameRef}
              fullWidth
              required
              error={!!formErrors.amenityName}
              helperText={formErrors.amenityName}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              inputRef={descRef}
              fullWidth
              multiline
              rows={3}
              error={!!formErrors.description}
              helperText={formErrors.description}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Price ($)"
              inputRef={priceRef}
              type="number"
              fullWidth
              sx={{ mb: 2 }}
              error={!!formErrors.price}
              helperText={formErrors.price}
              inputProps={{ step: "0.01", min: "0" }}
            />
            <Box display="flex" gap={2}>
              <TextField
                label="Opening Time"
                inputRef={openingRef}
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.openingTime}
                helperText={formErrors.openingTime}
              />
              <TextField
                label="Closing Time"
                inputRef={closingRef}
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.closingTime}
                helperText={formErrors.closingTime}
              />
            </Box>

            <Box display="flex" gap={2} mt={2}>
              <TextField
                label="Max Capacity"
                inputRef={maxCapacityRef}
                type="number"
                fullWidth
                error={!!formErrors.maxCapacity}
                helperText={formErrors.maxCapacity}
                inputProps={{ min: "1" }}
              />
            </Box>

            <Box display="flex" gap={2} mt={2}>
              <TextField
                label="Min Duration (hrs)"
                inputRef={minBookingDurationRef}
                type="number"
                fullWidth
                error={!!formErrors.minBookingDuration}
                helperText={formErrors.minBookingDuration}
                inputProps={{ step: "0.5", min: "0" }}
              />
              <TextField
                label="Max Duration (hrs)"
                inputRef={maxBookingDurationRef}
                type="number"
                fullWidth
                error={!!formErrors.maxBookingDuration}
                helperText={formErrors.maxBookingDuration}
                inputProps={{ step: "0.5", min: "0" }}
              />
            </Box>

            <Box display="flex" justifyContent="space-between" mt={2} flexWrap="wrap">
              <FormControlLabel
                control={
                  <Switch
                    inputRef={requiresApprovalRef}
                    color="primary"
                    defaultChecked={false}
                  />
                }
                label="Requires Approval"
              />
              <FormControlLabel
                control={
                  <Switch
                    inputRef={isBookableRef}
                    color="primary"
                    defaultChecked={false}
                  />
                }
                label="Bookable"
              />
              <FormControlLabel
                control={
                  <Switch
                    inputRef={isActiveRef}
                    color="primary"
                    defaultChecked={true}
                  />
                }
                label="Active"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setOpenDialog(false);
              setEditAmenity(null);
            }}
            color="secondary"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAmenity}
            disabled={creating}
            sx={{ textTransform: "none" }}
          >
            {creating ? (
              <CircularProgress size={22} />
            ) : editAmenity ? (
              "Save Changes"
            ) : (
              "Create"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Booking Dialog */}
      {(bookingAmenity || editingBooking) && (
        <AmenityBookingDialog
          open={!!bookingAmenity || !!editingBooking}
          onClose={() => {
            setBookingAmenity(null);
            setEditingBooking(null);
          }}
          amenity={bookingAmenity}
          booking={editingBooking}
          onBookingCreated={() => {
            alert(editingBooking ? "Booking updated successfully!" : "Booking created successfully!");
            setBookingAmenity(null);
            setEditingBooking(null);
          }}
        />
      )}

      {/* Details Dialog */}
      {viewBooking && (
        <AmenityBookingDetailsDialog
          open={!!viewBooking}
          onClose={() => setViewBooking(null)}
          booking={viewBooking}
          onUpdate={() => {
            setRefreshTrigger(prev => prev + 1);
            setViewBooking(null);
          }}
        />
      )}
    </Box>
  );
};


export default Amenities;

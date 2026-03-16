/** Design-token palette for zone rendering.  Wraps at length. */
export const ZONE_COLORS = [
    "#00E5B9", // brand teal
    "#6c41f0", // brand purple
    "#ff5926", // brand orange
    "#d52e66", // brand rose
    "#00bd81", // brand green
    "#001769", // brand navy
    "#7dd3fc", // sky
    "#fbbf24", // amber
];
/** Get the zone color by array index (wraps around). */
export function getZoneColorByIndex(index) {
    return ZONE_COLORS[index % ZONE_COLORS.length];
}
/** Get the display color for a zone by its index in the zones array. */
export function getZoneColor(zones, zoneId) {
    const idx = zones.zones.findIndex((z) => z.id === zoneId);
    return idx >= 0 ? getZoneColorByIndex(idx) : "#555";
}
/** Build a map from zone id to its display color. */
export function buildZoneColorMap(zones) {
    const map = new Map();
    if (zones) {
        zones.zones.forEach((z, i) => {
            map.set(z.id, getZoneColorByIndex(i));
        });
    }
    return map;
}
//# sourceMappingURL=colors.js.map
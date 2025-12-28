package dev.slimevr.config;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.StdKeySerializers;
import dev.slimevr.config.serializers.BooleanMapDeserializer;
import dev.slimevr.tracking.trackers.TrackerRole;
import java.util.HashMap;
import java.util.Map;


public class BridgeConfig {

	@JsonDeserialize(using = BooleanMapDeserializer.class)
	@JsonSerialize(keyUsing = StdKeySerializers.StringKeySerializer.class)
	public Map<String, Boolean> trackers = new HashMap<>();
	public boolean automaticSharedTrackersToggling = true;

	/**
	 * SteamVR-only foot tracker position adjustment for the Driver bridge.
	 * <p>
	 * This controls where along the ankle→toe line the exported SteamVR foot tracker
	 * should be placed:
	 * <ul>
	 *   <li>1.0 = toe/end (current behavior)</li>
	 *   <li>0.5 = middle of the foot</li>
	 *   <li>0.0 = ankle</li>
	 * </ul>
	 * This is intentionally stored per-bridge (e.g. under bridges.steamvr).
	 */
	public boolean footTrackerOffsetEnabled = false;

	/**
	 * 0.0 = ankle, 0.5 = middle, 1.0 = toe/end.
	 * <p>
	 * Default is 0.5 so that enabling {@link #footTrackerOffsetEnabled} results in a
	 * mid-foot position by default.
	 */
	public float footTrackerAnkleToToeRatio = 0.5f;

	public BridgeConfig() {
	}

	public boolean getBridgeTrackerRole(TrackerRole role, boolean def) {
		return trackers.getOrDefault(role.name().toLowerCase(), def);
	}

	public void setBridgeTrackerRole(TrackerRole role, boolean val) {
		this.trackers.put(role.name().toLowerCase(), val);
	}

	public Map<String, Boolean> getTrackers() {
		return trackers;
	}
}

package dev.slimevr.config

import dev.slimevr.VRServer

class FiltersConfig {

	// Type of filtering applied (none, smoothing or prediction)
	var type = "prediction"

	// Amount/Intensity of the specified filtering (0 to 1)
	var amount = 0.2f

	// Smoothing-only: minimum smoothing factor (advanced)
	// Lower values mean stronger smoothing at high "amount" values.
	var smoothMin = 11f

	// Prediction-only: minimum prediction factor (advanced)
	// Lower values mean weaker prediction at low "amount" values.
	var predictMin = 10f

	// Prediction-only: multiplier applied to `amount` when computing prediction factor (advanced)
	// Higher values mean stronger prediction for the same "amount" value.
	var predictMultiplier = 15f

	// Prediction-only: number of past rotations used for prediction (advanced)
	// Higher values may increase prediction stability but can add jitter/overshoot.
	var predictBuffer = 6

	fun updateTrackersFilters() {
		for (tracker in VRServer.instance.allTrackers) {
			if (tracker.allowFiltering) {
				tracker.filteringHandler.readFilteringConfig(this, tracker.getRotation())
			}
		}
	}
}

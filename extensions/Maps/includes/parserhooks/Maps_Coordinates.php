<?php

use Maps\MapsFactory;

/**
 * Class for the 'coordinates' parser hooks,
 * which can transform the notation of a set of coordinates.
 *
 * @since 0.7
 *
 * @licence GNU GPL v2+
 * @author Jeroen De Dauw < jeroendedauw@gmail.com >
 */
class MapsCoordinates extends ParserHook {

	/**
	 * Renders and returns the output.
	 *
	 * @see ParserHook::render
	 *
	 * @since 0.7
	 *
	 * @param array $parameters
	 *
	 * @return string
	 */
	public function render( array $parameters ) {
		return MapsFactory::globalInstance()->getCoordinateFormatter()->format(
			$parameters['location'],
			$parameters['format'],
			$parameters['directional']
		);
	}

	/**
	 * @see ParserHook::getMessage()
	 *
	 * @since 1.0
	 */
	public function getMessage() {
		return 'maps-coordinates-description';
	}

	/**
	 * Gets the name of the parser hook.
	 *
	 * @see ParserHook::getName
	 *
	 * @since 0.7
	 *
	 * @return string
	 */
	protected function getName() {
		return 'coordinates';
	}

	/**
	 * Returns an array containing the parameter info.
	 *
	 * @see ParserHook::getParameterInfo
	 *
	 * @since 0.7
	 *
	 * @return array
	 */
	protected function getParameterInfo( $type ) {
		global $egMapsAvailableCoordNotations;
		global $egMapsCoordinateNotation;
		global $egMapsCoordinateDirectional;

		$params = [];

		$params['location'] = [
			'type' => 'coordinate',
		];

		$params['format'] = [
			'default' => $egMapsCoordinateNotation,
			'values' => $egMapsAvailableCoordNotations,
			'aliases' => 'notation',
			'tolower' => true,
		];

		$params['directional'] = [
			'type' => 'boolean',
			'default' => $egMapsCoordinateDirectional,
		];

		// Give grep a chance to find the usages:
		// maps-coordinates-par-location, maps-coordinates-par-format, maps-coordinates-par-directional
		foreach ( $params as $name => &$param ) {
			$param['message'] = 'maps-coordinates-par-' . $name;
		}

		return $params;
	}

	/**
	 * Returns the list of default parameters.
	 *
	 * @see ParserHook::getDefaultParameters
	 *
	 * @since 0.7
	 *
	 * @return array
	 */
	protected function getDefaultParameters( $type ) {
		return [ 'location', 'format', 'directional' ];
	}

}
<?php

namespace Maps\Parsers;

use FileFetcher\FileFetcher;
use FileFetcher\FileFetchingException;
use Maps\MapsFactory;
use Maps\PageContentFetcher;
use ValueParsers\ParseException;
use ValueParsers\ValueParser;

/**
 * @licence GNU GPL v2+
 * @author Jeroen De Dauw < jeroendedauw@gmail.com >
 */
class JsonFileParser implements ValueParser {

	private $fileFetcher;
	private $pageContentFetcher;
	private $defaultNamespace;

	public function __construct( $fileFetcher = null, PageContentFetcher $pageContentFetcher = null ) {
		$this->fileFetcher = $fileFetcher instanceof FileFetcher
			? $fileFetcher : MapsFactory::newDefault()->getFileFetcher();

		$this->pageContentFetcher = $pageContentFetcher instanceof PageContentFetcher
			? $pageContentFetcher : MapsFactory::newDefault()->getPageContentFetcher();

		$this->defaultNamespace = NS_GEO_JSON;
	}

	/**
	 * @param string $fileLocation
	 *
	 * @return array
	 * @throws ParseException
	 */
	public function parse( $fileLocation ) {
		$jsonString = $this->getJsonString( $fileLocation );

		if ( $jsonString === null ) {
			return [];
		}

		$json = json_decode( $jsonString, true );

		if ( $json === null ) {
			return [];
		}

		return $json;
	}

	private function getJsonString( string $fileLocation ): ?string {
		$content = $this->pageContentFetcher->getPageContent( $fileLocation, $this->defaultNamespace );

		if ( $content instanceof \JsonContent ) {
			return $content->getNativeData();
		}

		// Prevent reading JSON files on the server
		if( !filter_var( $fileLocation, FILTER_VALIDATE_URL) ) {
			return null;
		}

		try {
			return $this->fileFetcher->fetchFile( $fileLocation );
		}
		catch ( FileFetchingException $ex ) {
			return null;
		}
	}


}

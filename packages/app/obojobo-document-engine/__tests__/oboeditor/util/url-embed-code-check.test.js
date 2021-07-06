import {
	parseURLOrEmbedCode,
	getStandardizedURLFromVideoId
} from 'obojobo-document-engine/src/scripts/oboeditor/util/url-embed-code-check'

const IFRAME_NODE = 'ObojoboDraft.Chunks.IFrame'
const YOUTUBE_NODE = 'ObojoboDraft.Chunks.YouTube'

// Example list of URLs modified from https://gist.github.com/rodrigoborgesdeoliveira/987683cfbfcc8d800192da1e73adc486
// Items at the bottom of the list result in "bad" values, but are expected output based on the
// algorithm
describe('parseURLOrEmbedCode works as expected for Youtube nodes', () => {
	test.each`
		userString                                                                                                                                                                                                                       | videoId                   | standardizedVideoUrl                      | startSeconds | endSeconds
		${'dQw4w9WgXcQ'}                                                                                                                                                                                                                 | ${'dQw4w9WgXcQ'}          | ${'http://youtu.be/dQw4w9WgXcQ'}          | ${null}      | ${null}
		${'http://www.youtube.com/watch?v=-wtIMTCHWuI'}                                                                                                                                                                                  | ${'-wtIMTCHWuI'}          | ${'http://youtu.be/-wtIMTCHWuI'}          | ${null}      | ${null}
		${'http://www.youtube.com/v/-wtIMTCHWuI?version=3&autohide=1'}                                                                                                                                                                   | ${'-wtIMTCHWuI'}          | ${'http://youtu.be/-wtIMTCHWuI'}          | ${null}      | ${null}
		${'http://youtu.be/-wtIMTCHWuI'}                                                                                                                                                                                                 | ${'-wtIMTCHWuI'}          | ${'http://youtu.be/-wtIMTCHWuI'}          | ${null}      | ${null}
		${'https://www.youtube.com/watch?v=yZv2daTWRZU&feature=em-uploademail'}                                                                                                                                                          | ${'yZv2daTWRZU'}          | ${'http://youtu.be/yZv2daTWRZU'}          | ${null}      | ${null}
		${'https://www.youtube.com/watch?v=0zM3nApSvMg&feature=feedrec_grec_index'}                                                                                                                                                      | ${'0zM3nApSvMg'}          | ${'http://youtu.be/0zM3nApSvMg'}          | ${null}      | ${null}
		${'https://www.youtube.com/v/0zM3nApSvMg?fs=1&amp;hl=en_US&amp;rel=0'}                                                                                                                                                           | ${'0zM3nApSvMg'}          | ${'http://youtu.be/0zM3nApSvMg'}          | ${null}      | ${null}
		${'www.youtube.com/watch?v=0zM3nApSvMg#t=0m10s'}                                                                                                                                                                                 | ${'0zM3nApSvMg'}          | ${'http://youtu.be/0zM3nApSvMg'}          | ${10}        | ${null}
		${'//www.youtube.com/embed/0zM3nApSvMg?rel=0&start=123'}                                                                                                                                                                         | ${'0zM3nApSvMg'}          | ${'http://youtu.be/0zM3nApSvMg'}          | ${123}       | ${null}
		${'https://www.youtube-nocookie.com/embed/up_lNV-yoK4?t=3'}                                                                                                                                                                      | ${'up_lNV-yoK4'}          | ${'http://youtu.be/up_lNV-yoK4'}          | ${3}         | ${null}
		${'www.youtube-nocookie.com/embed/up_lNV-yoK4?t=3'}                                                                                                                                                                              | ${'up_lNV-yoK4'}          | ${'http://youtu.be/up_lNV-yoK4'}          | ${3}         | ${null}
		${'//youtube-nocookie.com/embed/up_lNV-yoK4?t=3'}                                                                                                                                                                                | ${'up_lNV-yoK4'}          | ${'http://youtu.be/up_lNV-yoK4'}          | ${3}         | ${null}
		${'https://www.youtube-nocookie.com/embed/up_lNV-yoK4?rel=0&t=1m'}                                                                                                                                                               | ${'up_lNV-yoK4'}          | ${'http://youtu.be/up_lNV-yoK4'}          | ${60}        | ${null}
		${'http://www.youtube.com/watch?v=cKZDdG9FTKY&feature=channel&t=05s'}                                                                                                                                                            | ${'cKZDdG9FTKY'}          | ${'http://youtu.be/cKZDdG9FTKY'}          | ${5}         | ${null}
		${'http://www.youtube.com/watch?v=yZ-K7nCVnBI&playnext_from=TL&videos=osPknwzXEas&end=4m13s'}                                                                                                                                    | ${'yZ-K7nCVnBI'}          | ${'http://youtu.be/yZ-K7nCVnBI'}          | ${null}      | ${253}
		${'http://www.youtube.com/ytscreeningroom?v=NRHVzbJVx8I&start=12&end=14'}                                                                                                                                                        | ${'NRHVzbJVx8I'}          | ${'http://youtu.be/NRHVzbJVx8I'}          | ${12}        | ${14}
		${'http://www.youtube.com/watch?v=6dwqZw0j_jY&feature=youtu.be'}                                                                                                                                                                 | ${'6dwqZw0j_jY'}          | ${'http://youtu.be/6dwqZw0j_jY'}          | ${null}      | ${null}
		${'http://www.youtube.com/embed/nas1rJpm7wY?rel=0'}                                                                                                                                                                              | ${'nas1rJpm7wY'}          | ${'http://youtu.be/nas1rJpm7wY'}          | ${null}      | ${null}
		${'https://www.youtube.com/watch?v=peFZbP64dsU'}                                                                                                                                                                                 | ${'peFZbP64dsU'}          | ${'http://youtu.be/peFZbP64dsU'}          | ${null}      | ${null}
		${'http://youtube.com/v/dQw4w9WgXcQ?feature=youtube_gdata_player'}                                                                                                                                                               | ${'dQw4w9WgXcQ'}          | ${'http://youtu.be/dQw4w9WgXcQ'}          | ${null}      | ${null}
		${'http://youtube.com/?v=dQw4w9WgXcQ&feature=youtube_gdata_player'}                                                                                                                                                              | ${'dQw4w9WgXcQ'}          | ${'http://youtu.be/dQw4w9WgXcQ'}          | ${null}      | ${null}
		${'http://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=youtube_gdata_player'}                                                                                                                                                     | ${'dQw4w9WgXcQ'}          | ${'http://youtu.be/dQw4w9WgXcQ'}          | ${null}      | ${null}
		${'http://youtube.com/?vi=dQw4w9WgXcQ&feature=youtube_gdata_player'}                                                                                                                                                             | ${'dQw4w9WgXcQ'}          | ${'http://youtu.be/dQw4w9WgXcQ'}          | ${null}      | ${null}
		${'http://youtube.com/watch?v=dQw4w9WgXcQ&feature=youtube_gdata_player'}                                                                                                                                                         | ${'dQw4w9WgXcQ'}          | ${'http://youtu.be/dQw4w9WgXcQ'}          | ${null}      | ${null}
		${'http://youtube.com/watch?vi=dQw4w9WgXcQ&feature=youtube_gdata_player'}                                                                                                                                                        | ${'dQw4w9WgXcQ'}          | ${'http://youtu.be/dQw4w9WgXcQ'}          | ${null}      | ${null}
		${'http://youtube.com/vi/dQw4w9WgXcQ?feature=youtube_gdata_player'}                                                                                                                                                              | ${'dQw4w9WgXcQ'}          | ${'http://youtu.be/dQw4w9WgXcQ'}          | ${null}      | ${null}
		${'http://youtu.be/dQw4w9WgXcQ?feature=youtube_gdata_player'}                                                                                                                                                                    | ${'dQw4w9WgXcQ'}          | ${'http://youtu.be/dQw4w9WgXcQ'}          | ${null}      | ${null}
		${'https://www.youtube.com/watch?v=ishbTyLs6ps&list=PLGup6kBfcU7Le5laEaCLgTKtlDcxMqGxZ&index=106&shuffle=2655'}                                                                                                                  | ${'ishbTyLs6ps'}          | ${'http://youtu.be/ishbTyLs6ps'}          | ${null}      | ${null}
		${'http://www.youtube.com/v/0zM3nApSvMg?fs=1&hl=en_US&rel=0'}                                                                                                                                                                    | ${'0zM3nApSvMg'}          | ${'http://youtu.be/0zM3nApSvMg'}          | ${null}      | ${null}
		${'http://www.youtube.com/watch?v=0zM3nApSvMg&feature=feedrec_grec_index'}                                                                                                                                                       | ${'0zM3nApSvMg'}          | ${'http://youtu.be/0zM3nApSvMg'}          | ${null}      | ${null}
		${'http://www.youtube.com/watch?v=0zM3nApSvMg#t=0m10s'}                                                                                                                                                                          | ${'0zM3nApSvMg'}          | ${'http://youtu.be/0zM3nApSvMg'}          | ${10}        | ${null}
		${'http://www.youtube.com/embed/dQw4w9WgXcQ'}                                                                                                                                                                                    | ${'dQw4w9WgXcQ'}          | ${'http://youtu.be/dQw4w9WgXcQ'}          | ${null}      | ${null}
		${'http://www.youtube.com/v/dQw4w9WgXcQ'}                                                                                                                                                                                        | ${'dQw4w9WgXcQ'}          | ${'http://youtu.be/dQw4w9WgXcQ'}          | ${null}      | ${null}
		${'http://www.youtube.com/e/dQw4w9WgXcQ'}                                                                                                                                                                                        | ${'dQw4w9WgXcQ'}          | ${'http://youtu.be/dQw4w9WgXcQ'}          | ${null}      | ${null}
		${'http://www.youtube.com/?v=dQw4w9WgXcQ'}                                                                                                                                                                                       | ${'dQw4w9WgXcQ'}          | ${'http://youtu.be/dQw4w9WgXcQ'}          | ${null}      | ${null}
		${'http://www.youtube.com/watch?feature=player_embedded&v=dQw4w9WgXcQ'}                                                                                                                                                          | ${'dQw4w9WgXcQ'}          | ${'http://youtu.be/dQw4w9WgXcQ'}          | ${null}      | ${null}
		${'http://www.youtube.com/?feature=player_embedded&v=dQw4w9WgXcQ'}                                                                                                                                                               | ${'dQw4w9WgXcQ'}          | ${'http://youtu.be/dQw4w9WgXcQ'}          | ${null}      | ${null}
		${'http://www.youtube-nocookie.com/v/6L3ZvIMwZFM?version=3&hl=en_US&rel=0'}                                                                                                                                                      | ${'6L3ZvIMwZFM'}          | ${'http://youtu.be/6L3ZvIMwZFM'}          | ${null}      | ${null}
		${'https://youtu.be/oTJRivZTMLs?list=PLToa5JuFMsXTNkrLJbRlB--76IAOjRM9b'}                                                                                                                                                        | ${'oTJRivZTMLs'}          | ${'http://youtu.be/oTJRivZTMLs'}          | ${null}      | ${null}
		${'http://www.youtube.com/watch?v=oTJRivZTMLs&feature=youtu.be'}                                                                                                                                                                 | ${'oTJRivZTMLs'}          | ${'http://youtu.be/oTJRivZTMLs'}          | ${null}      | ${null}
		${'http://youtu.be/oTJRivZTMLs&feature=channel'}                                                                                                                                                                                 | ${'oTJRivZTMLs'}          | ${'http://youtu.be/oTJRivZTMLs'}          | ${null}      | ${null}
		${'http://www.youtube.com/ytscreeningroom?v=oTJRivZTMLs'}                                                                                                                                                                        | ${'oTJRivZTMLs'}          | ${'http://youtu.be/oTJRivZTMLs'}          | ${null}      | ${null}
		${'http://www.youtube.com/embed/oTJRivZTMLs?rel=0'}                                                                                                                                                                              | ${'oTJRivZTMLs'}          | ${'http://youtu.be/oTJRivZTMLs'}          | ${null}      | ${null}
		${'http://youtube.com/vi/oTJRivZTMLs&feature=channel'}                                                                                                                                                                           | ${'oTJRivZTMLs'}          | ${'http://youtu.be/oTJRivZTMLs'}          | ${null}      | ${null}
		${'http://youtube.com/?v=oTJRivZTMLs&feature=channel'}                                                                                                                                                                           | ${'oTJRivZTMLs'}          | ${'http://youtu.be/oTJRivZTMLs'}          | ${null}      | ${null}
		${'http://youtube.com/?feature=channel&v=oTJRivZTMLs'}                                                                                                                                                                           | ${'oTJRivZTMLs'}          | ${'http://youtu.be/oTJRivZTMLs'}          | ${null}      | ${null}
		${'http://youtube.com/?vi=oTJRivZTMLs&feature=channel'}                                                                                                                                                                          | ${'oTJRivZTMLs'}          | ${'http://youtu.be/oTJRivZTMLs'}          | ${null}      | ${null}
		${'http://youtube.com/watch?v=oTJRivZTMLs&feature=channel'}                                                                                                                                                                      | ${'oTJRivZTMLs'}          | ${'http://youtu.be/oTJRivZTMLs'}          | ${null}      | ${null}
		${'http://youtube.com/watch?vi=oTJRivZTMLs&feature=channel'}                                                                                                                                                                     | ${'oTJRivZTMLs'}          | ${'http://youtu.be/oTJRivZTMLs'}          | ${null}      | ${null}
		${'https://m.youtube.com/watch?v=m_kbvp0_8tc'}                                                                                                                                                                                   | ${'m_kbvp0_8tc'}          | ${'http://youtu.be/m_kbvp0_8tc'}          | ${null}      | ${null}
		${'<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'} | ${'dQw4w9WgXcQ'}          | ${'http://youtu.be/dQw4w9WgXcQ'}          | ${null}      | ${null}
		${'<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?start=3"></iframe>'}                                                                                                                                                   | ${'dQw4w9WgXcQ'}          | ${'http://youtu.be/dQw4w9WgXcQ'}          | ${3}         | ${null}
		${'http://www.youtube.com/oembed?url=http%3A//www.youtube.com/watch?v%3D-wtIMTCHWuI&format=json'}                                                                                                                                | ${'oembed'}               | ${'http://youtu.be/oembed'}               | ${null}      | ${null}
		${'http://www.youtube.com/attribution_link?a=JdfC0C9V6ZI&u=%2Fwatch%3Fv%3DEhxJLojIE_o%26feature%3Dshare'}                                                                                                                        | ${'attribution_link'}     | ${'http://youtu.be/attribution_link'}     | ${null}      | ${null}
		${'https://www.youtube.com/attribution_link?a=8g8kPrPIi-ecwIsS&u=/watch%3Fv%3DyZv2daTWRZU%26feature%3Dem-uploademail'}                                                                                                           | ${'attribution_link'}     | ${'http://youtu.be/attribution_link'}     | ${null}      | ${null}
		${'http://www.youtube.com/user/SilkRoadTheatre#p/a/u/2/6dwqZw0j_jY'}                                                                                                                                                             | ${'SilkRoadTheatre'}      | ${'http://youtu.be/SilkRoadTheatre'}      | ${null}      | ${null}
		${'http://www.youtube.com/user/IngridMichaelsonVEVO#p/u/11/KdwsulMb8EQ'}                                                                                                                                                         | ${'IngridMichaelsonVEVO'} | ${'http://youtu.be/IngridMichaelsonVEVO'} | ${null}      | ${null}
		${'http://www.youtube.com/user/dreamtheater#p/u/1/oTJRivZTMLs'}                                                                                                                                                                  | ${'dreamtheater'}         | ${'http://youtu.be/dreamtheater'}         | ${null}      | ${null}
		${'https://www.youtube.com/user/IngridMichaelsonVEVO#p/a/u/1/QdK8U-VIH_o'}                                                                                                                                                       | ${'IngridMichaelsonVEVO'} | ${'http://youtu.be/IngridMichaelsonVEVO'} | ${null}      | ${null}
		${'http://www.youtube.com/user/Scobleizer#p/u/1/1p3vcRhsYGo'}                                                                                                                                                                    | ${'Scobleizer'}           | ${'http://youtu.be/Scobleizer'}           | ${null}      | ${null}
		${'http://www.youtube.com/user/Scobleizer#p/u/1/Scobleizer?rel=0 '}                                                                                                                                                              | ${'Scobleizer'}           | ${'http://youtu.be/Scobleizer'}           | ${null}      | ${null}
	`(
		'parseURLOrEmbedCode("$userString") = {videoId:"$videoId",standardizedVideoUrl:"$standardizedVideoUrl",startSeconds:"$startSeconds",endSeconds:"$endSeconds"}',
		({ userString, videoId, standardizedVideoUrl, startSeconds, endSeconds }) => {
			const info = parseURLOrEmbedCode(userString, YOUTUBE_NODE)

			expect(info.videoId).toBe(videoId)
			expect(info.standardizedVideoUrl).toBe(standardizedVideoUrl)
			expect(info.startSeconds).toBe(startSeconds)
			expect(info.endSeconds).toBe(endSeconds)
		}
	)

	test('parseURLOrEmbedCode works as expected for IFrame nodes', () => {
		let userString = 'https://mock-url.com'
		let info = parseURLOrEmbedCode(userString, IFRAME_NODE)
		expect(info).toStrictEqual(new URL(userString))

		userString = 'http://mock-url.com'
		info = parseURLOrEmbedCode(userString, IFRAME_NODE)
		expect(info).toStrictEqual(new URL(userString))

		userString = 'https://www.mock-url.com'
		info = parseURLOrEmbedCode(userString, IFRAME_NODE)
		expect(info).toStrictEqual(new URL(userString))

		userString = 'http://www.mock-url.com'
		info = parseURLOrEmbedCode(userString, IFRAME_NODE)
		expect(info).toStrictEqual(new URL(userString))

		userString = '<iframe width="560" height="315" src="http://mock-url.com">'
		info = parseURLOrEmbedCode(userString, IFRAME_NODE)
		expect(info).toStrictEqual(new URL('http://mock-url.com'))

		userString = '<iframe width="560" height="315" src="https://mock-url.com">'
		info = parseURLOrEmbedCode(userString, IFRAME_NODE)
		expect(info).toStrictEqual(new URL('https://mock-url.com'))

		userString = 'htxp://mock'
		info = parseURLOrEmbedCode(userString, IFRAME_NODE)
		expect(info).toBe(false)

		userString = 'ottttp://mock'
		info = parseURLOrEmbedCode(userString, IFRAME_NODE)
		expect(info).toBe(false)

		userString = 'ftp'
		info = parseURLOrEmbedCode(userString, IFRAME_NODE)
		expect(info).toBe(false)

		userString = '<iframe width="560" height="315" src="htxp://mock-url.com">'
		info = parseURLOrEmbedCode(userString, IFRAME_NODE)
		expect(info).toBe(false)

		userString = 'iframe width="560" height="315" src="htxp://mock-url.com">'
		info = parseURLOrEmbedCode(userString, IFRAME_NODE)
		expect(info).toBe(false)

		userString = '<iframe width="560" height="315" src="mock">'
		info = parseURLOrEmbedCode(userString, IFRAME_NODE)
		expect(info).toBe(false)
	})

	test('getStandardizedURLFromVideoId returns "" when passed in falsy values', () => {
		expect(getStandardizedURLFromVideoId(null)).toBe('')
		expect(getStandardizedURLFromVideoId(false)).toBe('')
		expect(getStandardizedURLFromVideoId('')).toBe('')
		expect(getStandardizedURLFromVideoId()).toBe('')
	})

	test('getStandardizedURLFromVideoId returns a URL with the passed in id appended', () => {
		expect(getStandardizedURLFromVideoId('mock-id')).toBe('http://youtu.be/mock-id')
	})
})

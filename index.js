import fetch from 'node-fetch';
import zlib from 'zlib';
import { parseStringPromise } from 'xml2js';

export default async (req, res) => {
  const { country = 'ma', channel } = req.query;
  const url = `https://iptv-org.github.io/epg/guides/${country}.xml.gz`;

  try {
    const response = await fetch(url);
    const buffer = await response.buffer();
    const xml = zlib.gunzipSync(buffer).toString();

    const json = await parseStringPromise(xml);
    const allPrograms = json.tv.programme;

    // تصفية حسب القناة إذا كاينة
    const filtered = channel
      ? allPrograms.filter(p => p.$.channel === channel)
      : allPrograms.slice(0, 50); // فقط أول 50 برنامج

    res.status(200).json(filtered);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
};

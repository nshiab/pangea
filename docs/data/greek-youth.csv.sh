URI="https://ec.europa.eu/eurostat/databrowser-backend/api/extraction/1.0/LIVE/true/sdmx/csv/ilc_lvps08?i=1&compressed=true";
CACHE="$TMPDIR/observablehq-cli/ilc_lvps08.csv.gz";
mkdir -p $(dirname "$CACHE");
if [ ! -e "$CACHE" ]; then curl -o "$CACHE" "$URI"; fi

duckdb -csv :memory: <<EOF

WITH ilc AS (
  FROM read_csv('$CACHE', AUTO_DETECT=TRUE)
 WHERE geo = 'EL'
   AND age IN ('Y16-19', 'Y20-24', 'Y25-29')
)

SELECT
    a.OBS_VALUE AS M
  , b.OBS_VALUE AS F
  , a.TIME_PERIOD AS year
  , a.age AS age
FROM
    ilc AS a
  LEFT JOIN
    ilc AS b
  ON a.TIME_PERIOD = b.TIME_PERIOD AND a.sex='M' AND b.sex='F' AND a.age = b.age

EOF

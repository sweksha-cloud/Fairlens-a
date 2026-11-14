# Demo video

A 37-second video of FairLens checking the UCI Adult census data (32,561 people) on the live site, built
with [Remotion](https://www.remotion.dev) (React components rendered to MP4). 1920x1080, 30 fps,
captions, no audio, played at 1.25x speed.

Nothing in it is mocked up by hand:

- **Dataset scene:** real rows of the CSV, from `src/data/rows.json`.
- **Site scene:** a screen recording of the deployed site (fairlens-a.vercel.app) uploading the file and
  scrolling the report.
- **Findings scene:** the numbers the live API returned for that file, from `src/data/report.json`.

## Rebuild it

Get the data: the [UCI Adult dataset](https://archive.ics.uci.edu/dataset/2/adult) (`adult.data`), saved as
a CSV with this header row:

```
age,workclass,fnlwgt,education,education_num,marital_status,occupation,relationship,race,sex,capital_gain,capital_loss,hours_per_week,native_country,income
```

```bash
cd demo-video
npm install
export ADULT_CSV=~/Downloads/adult-census-income.csv
npm run data      # runs the live API on the CSV: writes src/data/rows.json and report.json
npm run record    # records the live site: writes public/site.mp4 and src/data/site-timing.json
npm run render    # writes out/fairlens-demo.mp4 (and the 1x cut, out/fairlens-demo-1x.mp4)
```

`npm run studio` opens Remotion's preview to scrub through the video while editing. The renders in `out/`
and the recording are gitignored. The site serves `frontend/public/demo/fairlens-demo.mp4`, and the main
README shows `docs/fairlens-demo.gif`, so after a new render:

```bash
cp out/fairlens-demo.mp4 ../frontend/public/demo/fairlens-demo.mp4
mkdir -p /tmp/fl-frames && ffmpeg -i out/fairlens-demo.mp4 -vf "fps=10,scale=800:-1:flags=lanczos" /tmp/fl-frames/%04d.png
gifski --fps 10 --width 800 --quality 70 -o ../docs/fairlens-demo.gif /tmp/fl-frames/*.png
```

import imagemin from 'imagemin'
import imageminPngquant from 'imagemin-pngquant'
import imageminSvgo from 'imagemin-svgo'

;(async () => {
  const files = await imagemin(['public/images/**/*.{png,svg}'], {
    destination: 'public/images',
    plugins: [
      imageminPngquant({
        quality: [0.6, 0.8],
      }),
      imageminSvgo({
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
        ],
      }),
    ],
  })

  console.log('Images optimized:', files.length)
})()

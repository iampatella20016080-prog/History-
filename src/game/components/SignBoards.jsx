import { useMemo } from 'react'
import { MeshToonMaterial } from 'three'
import { getMaterials } from '../rendering/materials.js'
import { getSignTexture } from '../rendering/signTexture.js'

function SignBoard({ sign }) {
  const material = useMemo(() => {
    const { gradientMap } = getMaterials()
    return new MeshToonMaterial({ map: getSignTexture(sign), gradientMap })
  }, [sign])

  return (
    <mesh position={sign.position} rotation-y={sign.rotationY} material={material} receiveShadow>
      <planeGeometry args={[sign.width, sign.height]} />
    </mesh>
  )
}

/** 招牌文字面板（貼圖以 Canvas 繪製，同樣文字的招牌共用貼圖） */
export function SignBoards({ signs }) {
  return signs.map((sign, index) => <SignBoard key={sign.id ?? index} sign={sign} />)
}

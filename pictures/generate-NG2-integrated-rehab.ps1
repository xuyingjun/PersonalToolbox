Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path "$PSScriptRoot\NG2.png").Path
$outputPath = Join-Path $PSScriptRoot 'NG2-integrated-rehab.png'
$image = [System.Drawing.Bitmap]::new($sourcePath)
$graphics = [System.Drawing.Graphics]::FromImage($image)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

function New-Brush([int]$red, [int]$green, [int]$blue, [int]$alpha = 255) {
    return [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb($alpha, $red, $green, $blue))
}

function New-Pen([int]$red, [int]$green, [int]$blue, [float]$width, [int]$alpha = 255) {
    $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb($alpha, $red, $green, $blue), $width)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    return $pen
}

function Fill-RoundedRectangle($targetGraphics, $brush, [float]$x, [float]$y, [float]$width, [float]$height, [float]$radius) {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $diameter = $radius * 2
    $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
    $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
    $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    $targetGraphics.FillPath($brush, $path)
    $path.Dispose()
}

function Draw-CenteredText($targetGraphics, [string]$text, $font, $brush, [float]$x, [float]$y, [float]$width, [float]$height) {
    $format = [System.Drawing.StringFormat]::new()
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $targetGraphics.DrawString($text, $font, $brush, [System.Drawing.RectangleF]::new($x, $y, $width, $height), $format)
    $format.Dispose()
}

function Draw-Joint($targetGraphics, [float]$x, [float]$y, [float]$radius, [string]$number, $font) {
    $outerBrush = New-Brush 29 206 204
    $innerBrush = New-Brush 235 250 251
    $textBrush = New-Brush 12 89 101
    $targetGraphics.FillEllipse($outerBrush, $x - $radius, $y - $radius, $radius * 2, $radius * 2)
    $targetGraphics.FillEllipse($innerBrush, $x - $radius + 4, $y - $radius + 4, ($radius - 4) * 2, ($radius - 4) * 2)
    Draw-CenteredText $targetGraphics $number $font $textBrush ($x - $radius) ($y - $radius) ($radius * 2) ($radius * 2)
    $outerBrush.Dispose()
    $innerBrush.Dispose()
    $textBrush.Dispose()
}

$shadowBrush = New-Brush 28 56 66 28
$skinBrush = New-Brush 226 179 148
$skinShadeBrush = New-Brush 190 139 113
$hairBrush = New-Brush 45 39 38
$shirtBrush = New-Brush 83 151 190
$shirtShadeBrush = New-Brush 54 112 152
$pantsBrush = New-Brush 47 70 91
$shoeBrush = New-Brush 50 60 66
$whiteBrush = New-Brush 246 250 250
$metalBrush = New-Brush 211 220 223
$metalDarkBrush = New-Brush 99 117 124
$cyanBrush = New-Brush 29 206 204
$navyBrush = New-Brush 13 52 72
$screenBrush = New-Brush 5 41 57 245
$screenPanelBrush = New-Brush 16 70 88 220
$screenMutedBrush = New-Brush 125 174 184
$greenBrush = New-Brush 66 220 164
$orangeBrush = New-Brush 255 177 66
$redBrush = New-Brush 255 103 92

$metalPen = New-Pen 113 132 139 26
$metalHighlightPen = New-Pen 221 232 234 15
$cyanPen = New-Pen 29 206 204 4
$cyanThinPen = New-Pen 29 206 204 2
$navyPen = New-Pen 19 63 82 3
$whitePen = New-Pen 237 248 249 2
$pantsPen = New-Pen 47 70 91 28
$shoePen = New-Pen 47 56 61 17
$skinPen = New-Pen 226 179 148 16
$shirtPen = New-Pen 83 151 190 28
$harnessPen = New-Pen 25 66 79 7

$font8 = [System.Drawing.Font]::new('Microsoft YaHei', 8, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$font9 = [System.Drawing.Font]::new('Microsoft YaHei', 9, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$font10 = [System.Drawing.Font]::new('Microsoft YaHei', 10, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$font11 = [System.Drawing.Font]::new('Microsoft YaHei', 11, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$font13 = [System.Drawing.Font]::new('Microsoft YaHei', 13, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$font16 = [System.Drawing.Font]::new('Microsoft YaHei', 16, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$jointFont = [System.Drawing.Font]::new('Arial', 8, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

# Ground shadows tie the added patient and arm into the original product render.
$graphics.FillEllipse($shadowBrush, 405, 682, 318, 39)
$graphics.FillEllipse($shadowBrush, 399, 375, 280, 42)

# Six-degree-of-freedom arm: two-layer industrial links mounted to the pelvic carriage.
$armPoints = @(
    [System.Drawing.PointF]::new(403, 401),
    [System.Drawing.PointF]::new(430, 356),
    [System.Drawing.PointF]::new(455, 313),
    [System.Drawing.PointF]::new(493, 285),
    [System.Drawing.PointF]::new(531, 300),
    [System.Drawing.PointF]::new(548, 335)
)
for ($index = 0; $index -lt $armPoints.Count - 1; $index++) {
    $graphics.DrawLine($metalPen, $armPoints[$index], $armPoints[$index + 1])
    $graphics.DrawLine($metalHighlightPen, $armPoints[$index], $armPoints[$index + 1])
}
$graphics.DrawLine($cyanPen, 403, 401, 430, 356)
$graphics.DrawLine($cyanThinPen, 455, 313, 493, 285)
for ($index = 0; $index -lt $armPoints.Count; $index++) {
    Draw-Joint $graphics $armPoints[$index].X $armPoints[$index].Y 13 ($index + 1).ToString() $jointFont
}
Fill-RoundedRectangle $graphics $navyBrush 383 389 43 28 7
Fill-RoundedRectangle $graphics $cyanBrush 388 393 33 5 2
Draw-Joint $graphics 403 401 13 '1' $jointFont

# Patient silhouette, positioned inside the pelvic mechanism in a walking phase.
$graphics.FillEllipse($skinBrush, 536, 171, 63, 72)
$graphics.FillEllipse($hairBrush, 535, 165, 65, 38)
$graphics.FillPie($hairBrush, 529, 176, 34, 55, 86, 190)
$graphics.FillEllipse($skinShadeBrush, 590, 199, 8, 13)
$graphics.DrawArc($navyPen, 552, 205, 29, 17, 20, 125)

$torsoPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
$torsoPath.AddBezier(533, 239, 513, 266, 508, 348, 516, 414)
$torsoPath.AddBezier(516, 414, 548, 431, 600, 428, 626, 407)
$torsoPath.AddBezier(626, 407, 626, 336, 617, 268, 596, 240)
$torsoPath.AddBezier(596, 240, 576, 250, 553, 250, 533, 239)
$torsoPath.CloseFigure()
$graphics.FillPath($shirtBrush, $torsoPath)
$graphics.DrawLine($cyanThinPen, 563, 251, 563, 397)
$graphics.DrawLine($whitePen, 580, 252, 601, 399)
$torsoPath.Dispose()

# Upper limbs: one arm connected to the six-axis robot, the other in reciprocal gait posture.
$graphics.DrawLine($shirtPen, 528, 274, 548, 331)
$graphics.DrawLine($skinPen, 548, 331, 565, 373)
$graphics.FillEllipse($skinBrush, 557, 365, 19, 21)
Fill-RoundedRectangle $graphics $navyBrush 537 321 25 27 8
$graphics.DrawLine($metalHighlightPen, 493, 285, 531, 300)
$graphics.DrawLine($metalHighlightPen, 531, 300, 548, 335)
Draw-Joint $graphics 531 300 13 '5' $jointFont
Draw-Joint $graphics 548 335 13 '6' $jointFont
Fill-RoundedRectangle $graphics $navyBrush 538 325 25 20 7
$graphics.FillRectangle($cyanBrush, 541, 329, 19, 4)
$graphics.DrawLine($shirtPen, 607, 274, 637, 322)
$graphics.DrawLine($skinPen, 637, 322, 665, 357)
$graphics.FillEllipse($skinBrush, 657, 348, 20, 20)

# Pelvic support and safety harness over the patient.
$graphics.DrawLine($harnessPen, 533, 255, 593, 405)
$graphics.DrawLine($harnessPen, 597, 255, 545, 405)
Fill-RoundedRectangle $graphics $navyBrush 501 396 133 36 11
Fill-RoundedRectangle $graphics $cyanBrush 510 402 115 6 3
Fill-RoundedRectangle $graphics $metalDarkBrush 558 400 22 27 5
$graphics.DrawLine($whitePen, 566, 406, 572, 420)

# Lower limbs in opposite phases communicate assisted gait coordination.
$graphics.DrawLine($pantsPen, 542, 429, 511, 536)
$graphics.DrawLine($pantsPen, 511, 536, 465, 644)
$graphics.DrawLine($pantsPen, 598, 429, 619, 542)
$graphics.DrawLine($pantsPen, 619, 542, 660, 655)
$graphics.DrawLine($shoePen, 465, 644, 431, 663)
$graphics.DrawLine($shoePen, 660, 655, 698, 660)
$graphics.FillEllipse($metalDarkBrush, 498, 522, 31, 31)
$graphics.FillEllipse($metalDarkBrush, 605, 528, 31, 31)
$graphics.FillEllipse($cyanBrush, 506, 530, 15, 15)
$graphics.FillEllipse($cyanBrush, 613, 536, 15, 15)

# Coordinated movement trajectories around arm and legs.
$cyanDashPen = New-Pen 29 206 204 3 210
$cyanDashPen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$graphics.DrawArc($cyanDashPen, 444, 250, 113, 148, 118, 168)
$graphics.DrawArc($cyanDashPen, 428, 483, 122, 190, 65, 130)
$graphics.DrawArc($cyanDashPen, 589, 478, 129, 195, 162, 132)
$graphics.DrawLine($cyanPen, 452, 288, 445, 273)
$graphics.DrawLine($cyanPen, 452, 288, 467, 285)
$graphics.DrawLine($cyanPen, 446, 622, 438, 638)
$graphics.DrawLine($cyanPen, 446, 622, 458, 633)
$graphics.DrawLine($cyanPen, 692, 629, 700, 646)
$graphics.DrawLine($cyanPen, 692, 629, 679, 641)

# Replace the large display content with an integrated training dashboard.
$largeScreen = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new(992, 147),
    [System.Drawing.PointF]::new(1100, 142),
    [System.Drawing.PointF]::new(1100, 459),
    [System.Drawing.PointF]::new(992, 459)
)
$graphics.FillPolygon($screenBrush, $largeScreen)
$graphics.FillRectangle($cyanBrush, 992, 147, 108, 5)
Draw-CenteredText $graphics '上下肢协同训练' $font11 $whiteBrush 994 158 104 23
$graphics.DrawLine($cyanThinPen, 1001, 184, 1092, 184)

# Gait cycle chart.
Fill-RoundedRectangle $graphics $screenPanelBrush 1000 193 92 75 5
$graphics.DrawString('步态周期', $font9, $screenMutedBrush, 1007, 198)
$chartPen = New-Pen 45 214 207 2
$chartPoints = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new(1006, 247),
    [System.Drawing.PointF]::new(1015, 240),
    [System.Drawing.PointF]::new(1024, 243),
    [System.Drawing.PointF]::new(1033, 222),
    [System.Drawing.PointF]::new(1042, 229),
    [System.Drawing.PointF]::new(1051, 215),
    [System.Drawing.PointF]::new(1060, 234),
    [System.Drawing.PointF]::new(1069, 225),
    [System.Drawing.PointF]::new(1085, 238)
)
$graphics.DrawLines($chartPen, $chartPoints)
$graphics.DrawString('左', $font8, $greenBrush, 1007, 251)
$graphics.DrawString('右', $font8, $orangeBrush, 1028, 251)

# Coordination score and symmetry bars.
Fill-RoundedRectangle $graphics $screenPanelBrush 1000 276 92 62 5
$graphics.DrawString('上下肢协调度', $font8, $screenMutedBrush, 1007, 282)
$graphics.DrawString('92%', $font16, $greenBrush, 1007, 296)
$graphics.FillRectangle($metalDarkBrush, 1007, 322, 75, 4)
$graphics.FillRectangle($greenBrush, 1007, 322, 69, 4)

Fill-RoundedRectangle $graphics $screenPanelBrush 1000 346 92 78 5
$graphics.DrawString('步态对称性', $font8, $screenMutedBrush, 1007, 351)
$graphics.DrawString('左侧', $font8, $whiteBrush, 1007, 369)
$graphics.FillRectangle($metalDarkBrush, 1034, 372, 47, 4)
$graphics.FillRectangle($cyanBrush, 1034, 372, 43, 4)
$graphics.DrawString('右侧', $font8, $whiteBrush, 1007, 384)
$graphics.FillRectangle($metalDarkBrush, 1034, 387, 47, 4)
$graphics.FillRectangle($orangeBrush, 1034, 387, 41, 4)
$graphics.DrawString('训练  18:42', $font9, $whiteBrush, 1007, 404)

# Update the embedded small display with live essentials.
Fill-RoundedRectangle $graphics $screenBrush 238 254 80 96 4
$graphics.FillRectangle($cyanBrush, 238, 254, 80, 4)
Draw-CenteredText $graphics '实时训练' $font9 $whiteBrush 240 262 76 16
$graphics.DrawString('速度', $font8, $screenMutedBrush, 245, 284)
$graphics.DrawString('1.2 km/h', $font10, $greenBrush, 270, 282)
$graphics.DrawString('减重', $font8, $screenMutedBrush, 245, 305)
$graphics.DrawString('30%', $font10, $cyanBrush, 282, 303)
$graphics.DrawString('心率', $font8, $screenMutedBrush, 245, 326)
$graphics.DrawString('86 bpm', $font10, $redBrush, 274, 324)

# Compact concept labels clarify the new functional additions without obscuring the product.
Fill-RoundedRectangle $graphics $whiteBrush 676 267 139 44 6
$graphics.DrawRectangle($cyanThinPen, 676, 267, 139, 44)
$graphics.DrawString('六自由度上肢机械臂', $font11, $navyBrush, 687, 275)
$graphics.DrawString('主动助力 / 协同控制', $font9, $screenMutedBrush, 687, 292)
$graphics.DrawLine($cyanThinPen, 676, 290, 552, 315)

Fill-RoundedRectangle $graphics $whiteBrush 685 396 121 42 6
$graphics.DrawRectangle($cyanThinPen, 685, 396, 121, 42)
$graphics.DrawString('骨盆动态支撑', $font11, $navyBrush, 697, 404)
$graphics.DrawString('安全绑定 / 重心跟随', $font9, $screenMutedBrush, 697, 421)
$graphics.DrawLine($cyanThinPen, 685, 417, 632, 414)

$image.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$disposables = @(
    $graphics, $image, $shadowBrush, $skinBrush, $skinShadeBrush, $hairBrush, $shirtBrush,
    $shirtShadeBrush, $pantsBrush, $shoeBrush, $whiteBrush, $metalBrush, $metalDarkBrush,
    $cyanBrush, $navyBrush, $screenBrush, $screenPanelBrush, $screenMutedBrush, $greenBrush,
    $orangeBrush, $redBrush, $metalPen, $metalHighlightPen, $cyanPen, $cyanThinPen, $navyPen,
    $whitePen, $pantsPen, $shoePen, $skinPen, $shirtPen, $harnessPen, $cyanDashPen, $chartPen,
    $font8, $font9, $font10, $font11, $font13, $font16, $jointFont
)
foreach ($item in $disposables) {
    if ($null -ne $item) { $item.Dispose() }
}

Write-Output "Created: $outputPath"
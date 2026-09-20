import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.Ellipse2D;
import java.awt.image.BufferedImage;
import java.io.File;
import javax.imageio.ImageIO;

public class generate_icons {
    public static void main(String[] args) {
        try {
            File sourceFile = new File("assets/app-logo.jpg");
            if (!sourceFile.exists()) {
                sourceFile = new File("assets/icon.png");
            }
            BufferedImage original = ImageIO.read(sourceFile);

            int[] sizes = { 48, 72, 96, 144, 192 };
            String[] densities = { "mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi" };

            // Base drawable directory
            File baseDrawableDir = new File("android/app/src/main/res/drawable");
            if (!baseDrawableDir.exists()) baseDrawableDir.mkdirs();

            for (int i = 0; i < sizes.length; i++) {
                int size = sizes[i];
                String density = densities[i];
                File mipmapDir = new File("android/app/src/main/res/mipmap-" + density);
                if (!mipmapDir.exists()) mipmapDir.mkdirs();

                File drawableDir = new File("android/app/src/main/res/drawable-" + density);
                if (!drawableDir.exists()) drawableDir.mkdirs();

                // 1. Standard square launcher icon
                BufferedImage squareIcon = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
                Graphics2D g2d = squareIcon.createGraphics();
                g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
                g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                g2d.drawImage(original, 0, 0, size, size, null);
                g2d.dispose();
                ImageIO.write(squareIcon, "png", new File(mipmapDir, "ic_launcher.png"));
                ImageIO.write(squareIcon, "png", new File(drawableDir, "ic_launcher.png"));

                // 2. Round launcher icon
                BufferedImage roundIcon = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
                Graphics2D gRound = roundIcon.createGraphics();
                gRound.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                gRound.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                gRound.setClip(new Ellipse2D.Float(0, 0, size, size));
                gRound.drawImage(original, 0, 0, size, size, null);
                gRound.dispose();
                ImageIO.write(roundIcon, "png", new File(mipmapDir, "ic_launcher_round.png"));
                ImageIO.write(roundIcon, "png", new File(drawableDir, "ic_launcher_round.png"));

                // 3. Foreground launcher icon
                BufferedImage fgIcon = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
                Graphics2D gFg = fgIcon.createGraphics();
                gFg.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                gFg.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                gFg.drawImage(original, 0, 0, size, size, null);
                gFg.dispose();
                ImageIO.write(fgIcon, "png", new File(mipmapDir, "ic_launcher_foreground.png"));

                // 4. Notification status bar icon (ic_stat_notification.png & ic_stat_icon_config_sample.png)
                ImageIO.write(squareIcon, "png", new File(drawableDir, "ic_stat_notification.png"));
                ImageIO.write(squareIcon, "png", new File(drawableDir, "ic_stat_icon_config_sample.png"));
            }

            // Write to base drawable as fallback
            BufferedImage baseIcon = new BufferedImage(96, 96, BufferedImage.TYPE_INT_ARGB);
            Graphics2D gBase = baseIcon.createGraphics();
            gBase.drawImage(original, 0, 0, 96, 96, null);
            gBase.dispose();
            ImageIO.write(baseIcon, "png", new File(baseDrawableDir, "ic_stat_notification.png"));
            ImageIO.write(baseIcon, "png", new File(baseDrawableDir, "ic_stat_icon_config_sample.png"));
            ImageIO.write(baseIcon, "png", new File(baseDrawableDir, "ic_launcher.png"));

            System.out.println("✓ Generated all launcher and notification icons across drawable and mipmap folders!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

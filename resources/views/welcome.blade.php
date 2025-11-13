<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <!-- Fallback CDN for quick styling if compiled assets are not available -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="{{ mix('css/app.css') }}">
</head>
<body>
    <div style="background: linear-gradient(135deg, #dbe8ff 0%, #dbe8ff 100%); min-height: 100vh;">
        <div id="root"></div>
    </div>
    <!-- Bootstrap bundle (toggler, dropdowns) as fallback for quick dev view -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/js/bootstrap.bundle.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="{{ mix('js/app.js') }}"></script>
</body>
</html>
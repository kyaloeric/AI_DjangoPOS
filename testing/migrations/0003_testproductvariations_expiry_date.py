# Generated by Django 3.1.2 on 2020-10-17 01:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('testing', '0002_auto_20201017_0158'),
    ]

    operations = [
        migrations.AddField(
            model_name='testproductvariations',
            name='expiry_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]

# Generated by Django 3.1.2 on 2021-04-07 06:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stockbillitems',
            name='is_new_variation',
            field=models.BooleanField(blank=True, default=False, null=True),
        ),
    ]
